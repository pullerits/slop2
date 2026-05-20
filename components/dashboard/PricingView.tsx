export function PricingView() {
  return (
    <section className="py-8">
      <div className="mb-8 max-w-3xl">
        <p className="quiet-label text-[#6a6a6a]">Simple prices</p>
        <h2 className="editorial-title mt-4 text-5xl sm:text-6xl">
          Pick the plan that keeps your progress moving.
        </h2>
        <p className="mt-5 text-base leading-7 text-[#3a3a3a]">
          A classic three-tier setup for solo tracking, premium daily
          systems, and shared accountability.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            name: "Starter",
            price: "$0",
            cadence: "forever",
            description: "For trying the daily loop and tracking a few habits.",
            features: [
              "3 active habits",
              "Daily completion tracking",
              "Basic life-area levels",
              "Local browser storage",
            ],
            action: "Start free",
            featured: false,
          },
          {
            name: "Premium",
            price: "$8",
            cadence: "per month",
            description: "For a richer system with deeper streaks and planning.",
            features: [
              "Unlimited habits",
              "Advanced streak insights",
              "Weekly review prompts",
              "Priority feature access",
            ],
            action: "Upgrade to Premium",
            featured: true,
          },
          {
            name: "Team",
            price: "$18",
            cadence: "per month",
            description: "For partners, families, or small accountability groups.",
            features: [
              "Shared progress boards",
              "Group milestones",
              "Private member profiles",
              "Exportable activity history",
            ],
            action: "Create a team",
            featured: false,
          },
        ].map((plan) => (
          <article
            className={`relative flex min-h-[30rem] flex-col rounded-2xl p-6 ${
              plan.featured
                ? "bg-[#1a3a3a] text-white"
                : "border border-[#e5e5e5] bg-[#fffaf0] text-[#0a0a0a]"
            }`}
            key={plan.name}
          >
            {plan.featured ? (
              <span className="absolute right-5 top-5 rounded-full bg-[#e8b94a] px-3 py-1 text-xs font-semibold text-[#0a0a0a]">
                Popular
              </span>
            ) : null}

            <div>
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <div className="mt-6 flex items-end gap-2">
                <span className="editorial-number text-6xl">
                  {plan.price}
                </span>
                <span
                  className={`pb-2 text-sm ${
                    plan.featured ? "text-white/65" : "text-[#6a6a6a]"
                  }`}
                >
                  {plan.cadence}
                </span>
              </div>
              <p
                className={`mt-5 text-sm leading-6 ${
                  plan.featured ? "text-white/72" : "text-[#3a3a3a]"
                }`}
              >
                {plan.description}
              </p>
            </div>

            <ul className="mt-8 grid gap-3">
              {plan.features.map((feature) => (
                <li className="flex items-start gap-3 text-sm" key={feature}>
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                      plan.featured
                        ? "bg-white text-[#1a3a3a]"
                        : "bg-[#f5f0e0] text-[#0a0a0a]"
                    }`}
                  >
                    on
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`mt-auto h-11 rounded-xl px-5 text-sm font-semibold ${
                plan.featured
                  ? "button-on-dark bg-white text-[#0a0a0a]"
                  : "button-primary"
              }`}
            >
              {plan.action}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
