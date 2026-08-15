type Insight = {
    icon: string;
    title: string;
    text: string;
};

type Props = {
    title: string;
    insights: Insight[];
};

export default function AISection({
    title,
    insights,
}: Props) {

    return (

        <div
            className="
                bg-[var(--card)]
                border
                border-[var(--border)]
                rounded-xl
                p-5
            "
        >

            <h3 className="font-bold text-lg mb-5">
                🤖 {title}
            </h3>

            <div className="space-y-5">

                {insights.map((item, index) => (

                    <div
                        key={index}
                        className="
                            border-b
                            border-[var(--border)]
                            pb-4
                            last:border-0
                            last:pb-0
                        "
                    >

                        <div className="flex items-center gap-2 mb-2">

                            <span className="text-lg">
                                {item.icon}
                            </span>

                            <span className="font-semibold">
                                {item.title}
                            </span>

                        </div>

                        <p
                            className="
                                text-sm
                                text-[var(--muted)]
                                leading-6
                            "
                        >
                            {item.text}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    );

}