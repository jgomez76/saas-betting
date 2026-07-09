import { LegalContent } from "./types";

export const privacyContent: Record<
  "en" | "es" | "fr" | "it",
  LegalContent
> = {
    en: {
        locale: "en-GB",
        title: "Privacy Policy",
        updated: "2026-06-23",
        intro: "This Privacy Policy explains how Luranix collects, uses, stores and protects your personal information when you use our platform.",

        sections: [
        {
            title: "1. Introduction",
            content: [
            "Luranix is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and the rights you have regarding your personal data."
            ]
        },

        {
            title: "2. Information We Collect",
            bullets: [
            "Name and email address.",
            "Authentication provider information.",
            "User preferences and settings.",
            "Betting history stored inside the platform.",
            "Technical information such as browser type and device information."
            ]
        },

        {
            title: "3. How We Use Your Data",
            bullets: [
            "To provide and improve the service.",
            "To authenticate users.",
            "To personalize the platform experience.",
            "To communicate important account information.",
            "To comply with legal obligations."
            ]
        },

        {
            title: "4. Authentication Providers",
            content: [
            "Users may authenticate using email/password, Google, GitHub, or other providers that may be added in the future."
            ]
        },

        {
            title: "5. Data Retention",
            content: [
            "Personal information is retained only for as long as necessary to provide the service and fulfill legal obligations."
            ]
        },

        {
            title: "6. Your Rights",
            content: [
            "Depending on your jurisdiction, you may have the right to access, modify, export, or delete your personal information."
            ]
        },

        {
            title: "7. Contact",
            content: [
            "For privacy-related questions, contact:",
            ],

            contact: {
                label: "Email",
                value: "support@luranix.com"
        }
        }
        ]
    },

    es: {
    locale: "es-ES",
    title: "Política de Privacidad",
    updated: "2026-06-23",
    intro: "Esta Política de Privacidad explica cómo Luranix recopila, utiliza, almacena y protege tu información personal cuando utilizas nuestra plataforma.",

    sections: [
        {
        title: "1. Introducción",

        content: [
            "En Luranix nos comprometemos a proteger tu privacidad y a tratar tus datos personales de forma responsable y transparente. Esta Política de Privacidad explica qué información recopilamos, cómo la utilizamos y qué derechos tienes sobre tus datos personales."
        ]
        },

        {
        title: "2. Información que recopilamos",

        bullets: [
            "Nombre y dirección de correo electrónico.",
            "Información del proveedor de autenticación utilizado para iniciar sesión.",
            "Preferencias y configuración de la cuenta.",
            "Historial de apuestas almacenado dentro de la plataforma.",
            "Información técnica como el navegador, el dispositivo y datos básicos de uso."
        ]
        },

        {
        title: "3. Cómo utilizamos tus datos",

        bullets: [
            "Proporcionar, mantener y mejorar nuestros servicios.",
            "Autenticar a los usuarios y proteger sus cuentas.",
            "Personalizar la experiencia de uso dentro de la plataforma.",
            "Enviar comunicaciones importantes relacionadas con la cuenta.",
            "Cumplir con las obligaciones legales aplicables."
        ]
        },

        {
        title: "4. Proveedores de autenticación",

        content: [
            "Los usuarios pueden acceder mediante correo electrónico y contraseña, Google, GitHub u otros proveedores de autenticación que puedan incorporarse en el futuro."
        ]
        },

        {
        title: "5. Conservación de los datos",

        content: [
            "Los datos personales se conservarán únicamente durante el tiempo necesario para prestar el servicio, cumplir con las obligaciones legales y resolver posibles incidencias relacionadas con la plataforma."
        ]
        },

        {
        title: "6. Tus derechos",

        content: [
            "Dependiendo de la legislación aplicable, podrás solicitar el acceso, la rectificación, la exportación o la eliminación de tus datos personales, así como ejercer cualquier otro derecho reconocido por la normativa vigente."
        ]
        },

        {
        title: "7. Contacto",

        content: [
            "Si tienes cualquier duda sobre esta Política de Privacidad o sobre el tratamiento de tus datos personales, puedes ponerte en contacto con nosotros."
        ],

        contact: {
            label: "Correo electrónico",
            value: "support@luranix.com"
        }
        }
    ]
    },

    fr: {
    locale: "fr-FR",
    title: "Politique de confidentialité",
    updated: "2026-06-23",
    intro: "Cette Politique de confidentialité explique comment Luranix collecte, utilise, conserve et protège vos données personnelles lorsque vous utilisez notre plateforme.",

    sections: [
        {
        title: "1. Introduction",

        content: [
            "Chez Luranix, nous nous engageons à protéger votre vie privée et à traiter vos données personnelles de manière responsable et transparente. Cette Politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons et quels sont vos droits concernant vos données personnelles."
        ]
        },

        {
        title: "2. Informations que nous collectons",

        bullets: [
            "Nom et adresse e-mail.",
            "Informations relatives au fournisseur d'authentification utilisé pour la connexion.",
            "Préférences et paramètres du compte.",
            "Historique des paris enregistré sur la plateforme.",
            "Informations techniques telles que le navigateur, l'appareil utilisé et certaines données d'utilisation."
        ]
        },

        {
        title: "3. Utilisation de vos données",

        bullets: [
            "Fournir, maintenir et améliorer nos services.",
            "Authentifier les utilisateurs et protéger leurs comptes.",
            "Personnaliser l'expérience d'utilisation de la plateforme.",
            "Envoyer des communications importantes concernant votre compte.",
            "Respecter les obligations légales applicables."
        ]
        },

        {
        title: "4. Fournisseurs d'authentification",

        content: [
            "Les utilisateurs peuvent se connecter à l'aide d'une adresse e-mail et d'un mot de passe, de Google, de GitHub ou de tout autre fournisseur d'authentification qui pourra être ajouté à l'avenir."
        ]
        },

        {
        title: "5. Conservation des données",

        content: [
            "Les données personnelles sont conservées uniquement pendant la durée nécessaire à la fourniture du service, au respect des obligations légales et à la résolution d'éventuels incidents liés à la plateforme."
        ]
        },

        {
        title: "6. Vos droits",

        content: [
            "Selon la législation applicable, vous pouvez demander l'accès, la rectification, l'exportation ou la suppression de vos données personnelles, ainsi qu'exercer tout autre droit reconnu par la réglementation en vigueur."
        ]
        },

        {
        title: "7. Contact",

        content: [
            "Pour toute question concernant cette Politique de confidentialité ou le traitement de vos données personnelles, vous pouvez nous contacter."
        ],

        contact: {
            label: "Adresse e-mail",
            value: "support@luranix.com"
        }
        }
    ]
    },

    it: {
    locale: "it-IT",
    title: "Informativa sulla privacy",
    updated: "2026-06-23",
    intro: "La presente Informativa sulla privacy spiega come Luranix raccoglie, utilizza, conserva e protegge i tuoi dati personali quando utilizzi la nostra piattaforma.",

    sections: [
        {
        title: "1. Introduzione",

        content: [
            "In Luranix ci impegniamo a proteggere la tua privacy e a trattare i tuoi dati personali in modo responsabile e trasparente. La presente Informativa sulla privacy spiega quali informazioni raccogliamo, come le utilizziamo e quali diritti hai in merito ai tuoi dati personali."
        ]
        },

        {
        title: "2. Informazioni che raccogliamo",

        bullets: [
            "Nome e indirizzo e-mail.",
            "Informazioni relative al provider di autenticazione utilizzato per l'accesso.",
            "Preferenze e impostazioni dell'account.",
            "Cronologia delle scommesse memorizzata all'interno della piattaforma.",
            "Informazioni tecniche come browser, dispositivo utilizzato e dati di utilizzo di base."
        ]
        },

        {
        title: "3. Come utilizziamo i tuoi dati",

        bullets: [
            "Fornire, mantenere e migliorare i nostri servizi.",
            "Autenticare gli utenti e proteggere i loro account.",
            "Personalizzare l'esperienza d'uso della piattaforma.",
            "Inviare comunicazioni importanti relative all'account.",
            "Rispettare gli obblighi di legge applicabili."
        ]
        },

        {
        title: "4. Provider di autenticazione",

        content: [
            "Gli utenti possono accedere utilizzando e-mail e password, Google, GitHub o altri provider di autenticazione che potranno essere aggiunti in futuro."
        ]
        },

        {
        title: "5. Conservazione dei dati",

        content: [
            "I dati personali saranno conservati solo per il tempo necessario a fornire il servizio, adempiere agli obblighi di legge e risolvere eventuali problematiche legate alla piattaforma."
        ]
        },

        {
        title: "6. I tuoi diritti",

        content: [
            "In base alla normativa applicabile, puoi richiedere l'accesso, la rettifica, l'esportazione o la cancellazione dei tuoi dati personali, nonché esercitare qualsiasi altro diritto previsto dalla legislazione vigente."
        ]
        },

        {
        title: "7. Contatti",

        content: [
            "Per qualsiasi domanda relativa alla presente Informativa sulla privacy o al trattamento dei tuoi dati personali, puoi contattarci utilizzando i recapiti riportati di seguito."
        ],

        contact: {
            label: "E-mail",
            value: "support@luranix.com"
        }
        }
    ]
    },
};