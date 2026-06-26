export type LegalContact = {
  label: string;
  value: string;
};

export type LegalSection = {
  title: string;
  content?: string[];
  bullets?: string[];
  contact?: LegalContact;
};

export type LegalContent = {
  locale: string;
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
};
