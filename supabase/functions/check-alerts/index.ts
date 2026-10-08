// ==============================================================================
// OmniSpec Edge Function: check-alerts
// Evaluates active price alerts against live retailer pricing and dispatches
// transactional email notifications via Resend.
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

interface StorePrice {
  price: number;
  store: string;
  url: string;
}

interface PriceAlert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number;
  products: {
    name: string;
    brand: string;
    image_url: string;
  };
}

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const alertFrom = Deno.env.get("ALERT_FROM") || "alerts@omnispec.io";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration environment variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch unfulfilled price alerts with product details
    const { data: alerts, error: alertsError } = await supabase
      .from("price_alerts")
      .select(`
        id,
        user_id,
        product_id,
        target_price,
        products (
          name,
          brand,
          image_url
        )
      `)
      .eq("notified", false);

    if (alertsError) {
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active unfulfilled price alerts found.", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const triggeredAlerts: string[] = [];

    // 2. Evaluate each alert against current minimum retailer pricing
    for (const alert of (alerts as unknown as PriceAlert[])) {
      const { data: prices, error: pricesError } = await supabase
        .from("store_prices")
        .select("price, store, url")
        .eq("product_id", alert.product_id)
        .order("price", { ascending: true })
        .limit(1);

      if (pricesError || !prices || prices.length === 0) {
        continue;
      }

      const bestDeal: StorePrice = prices[0];

      // Check if price reached or dropped below target
      if (bestDeal.price <= alert.target_price) {
        // Fetch recipient user email from Supabase Auth admin API
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(alert.user_id);
        const userEmail = userData?.user?.email;

        if (userEmail && resendApiKey) {
          const emailSubject = `Price Drop Alert: ${alert.products.brand} ${alert.products.name} is now $${bestDeal.price}`;
          const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #4f46e5; font-size: 20px;">OmniSpec Price Intelligence</h2>
              </div>
              <h3 style="margin-top: 0; font-size: 18px; color: #0f172a;">Target Price Reached!</h3>
              <p style="font-size: 15px; line-height: 1.5; color: #475569;">
                Great news! <strong>${alert.products.brand} ${alert.products.name}</strong> just dropped to <strong>$${bestDeal.price.toFixed(2)}</strong> at <strong>${bestDeal.store}</strong>, meeting your target threshold of <strong>$${alert.target_price.toFixed(2)}</strong>.
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="${bestDeal.url}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  View Deal at ${bestDeal.store} &rarr;
                </a>
              </div>
              <p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 32px;">
                You are receiving this automated alert because you subscribed to price tracking on OmniSpec.
              </p>
            </div>
          `;

          // Dispatch via Resend API
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: alertFrom,
              to: [userEmail],
              subject: emailSubject,
              html: emailHtml
            })
          });
        }

        // 3. Mark alert as notified
        await supabase
          .from("price_alerts")
          .update({ notified: true })
          .eq("id", alert.id);

        triggeredAlerts.push(alert.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        evaluated: alerts.length,
        dispatched: triggeredAlerts.length,
        alertIds: triggeredAlerts
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
