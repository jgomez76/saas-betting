export async function upgradeToPremium(api: string): Promise<void> {

    const res = await fetch(`${api}/subscription/checkout`, {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Unable to create Stripe Checkout Session.");
    }

    const data = await res.json();

    window.location.href = data.url;
}

export async function manageSubscription(api: string): Promise<void> {

    const res = await fetch(`${api}/subscription/portal`, {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Unable to open Customer Portal.");
    }

    const data = await res.json();

    window.location.href = data.url;
}