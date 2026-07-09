type Props = {
    previewClass: string;
};

export default function ThemePreview({
    previewClass,
}: Props) {

    return (

        <div
            className={`
                ${previewClass}
                relative
                h-32
                overflow-hidden
            `}
        >

            {/* Sidebar */}

            <div
                className="
                    theme-preview-sidebar

                    absolute
                    left-0
                    top-0
                    bottom-0
                    w-7
                "
            />

            <div
                className="
                    absolute
                    left-2
                    top-8
                    flex
                    flex-col
                    gap-2
                "
            >
                <div className="w-3 h-3 rounded bg-white/25"/>
                <div className="w-3 h-3 rounded bg-white/15"/>
                <div className="w-3 h-3 rounded bg-white/15"/>
            </div>

            {/* Navbar */}

            <div
                className="
                    theme-preview-navbar
                    absolute
                    top-2
                    left-10
                    right-3
                    flex
                    items-center
                    justify-between
                "
            >

                <div className="flex gap-2">

                    <div className="h-2 w-12 rounded bg-white/25"/>

                    <div className="h-2 w-16 rounded bg-white/12"/>

                </div>

                <div className="w-3 h-3 rounded-full bg-white/20"/>

            </div>

            {/* Match Card */}

            <div
                className="
                    theme-preview-card

                    absolute
                    left-10
                    top-8
                    right-3

                    rounded-md
                    border

                    p-2
                "
            >

                {/* Equipos */}

                <div className="flex justify-between items-center text-[5px] text-white/85">

                    <span>France</span>

                    <span className="text-white/40">
                        vs
                    </span>

                    <span>Morocco</span>

                </div>

                {/* Hora */}

                <div
                    className="
                        mt-1
                        text-[4px]
                        text-center
                        text-white/45
                    "
                >
                    Today • 22:00
                </div>

                {/* Cuotas */}

                <div className="mt-2 flex gap-1">

                    <div
                        className="
                            flex-1
                            rounded
                            bg-white/12
                            py-1
                            text-center
                        "
                    >
                        <div className="text-[4px] text-white/45">
                            HOME
                        </div>

                        <div className="text-[7px] font-bold text-white">
                            1.85
                        </div>

                    </div>

                    <div
                        className="
                            flex-1
                            rounded
                            bg-white/18
                            py-1
                            text-center
                        "
                    >
                        <div className="text-[4px] text-white/45">
                            DRAW
                        </div>

                        <div className="text-[7px] font-bold text-white">
                            3.40
                        </div>

                    </div>

                    <div
                        className="
                            theme-preview-bet-highlight
                            flex-1
                            rounded
                            py-1
                            text-center
                        "
                        style={{
                            color:"var(--accent-contrast)"
                        }}
                    >

                        <div
                            className="text-[4px]"
                            style={{
                                color: "var(--accent-contrast)"
                            }}
                        >
                            AWAY
                        </div>

                        <div
                            className="text-[7px] font-bold"
                            style={{
                                color: "var(--accent-contrast)"
                            }}
                        >
                            4.90
                        </div>

                        <div
                            className="text-[4px] mt-0.5"
                            style={{
                                color: "var(--accent-contrast)"
                            }}
                        >
                            VALUE
                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}