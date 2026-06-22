import { ReactNode } from "react";

type Props = {
title: string;
updated: string;
children: ReactNode;
};

export default function LegalPage({
title,
updated,
children,
}: Props) {
return ( <div className="max-w-4xl mx-auto px-6 py-10">

  <h1 className="text-3xl font-bold mb-2">
    {title}
  </h1>

  <p className="text-sm opacity-60 mb-8">
    Last updated: {updated}
  </p>

  <div className="space-y-6 leading-7">
    {children}
  </div>

</div>

);
}
