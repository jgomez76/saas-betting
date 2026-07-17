type Props = {
    features: string[];
};

export default function PremiumBenefits({
    features,
}: Props) {

    return (

        <div className="grid md:grid-cols-2 gap-3">

            {features.map((feature) => (

                <div
                    key={feature}
                    className="flex items-center gap-3"
                >

                    <span className="text-[var(--positive)] font-bold">
                        ✓
                    </span>

                    <span>
                        {feature}
                    </span>

                </div>

            ))}

        </div>

    );

}