import { LegalContent } from "./types";

export const securityContent: Record<
  "en" | "es" | "fr" | "it",
  LegalContent
> = {
    en: {
    locale: "en-GB",

    title: "Security",

    updated: "2026-06-23",

    intro:
        "At Luranix, security is a fundamental priority. We are committed to protecting our platform, our users and their data by applying industry best practices and continuously improving our security measures.",

    sections: [

        {
        title: "1. Our Security Commitment",

        content: [
            "We continuously work to maintain a secure environment for all users by applying modern security standards, regular monitoring and ongoing improvements."
        ]
        },

        {
        title: "2. Account Security",

        bullets: [
            "Passwords are securely protected.",
            "Authentication providers follow industry security standards.",
            "Account verification and password recovery mechanisms are available.",
            "Users are responsible for maintaining the confidentiality of their credentials."
        ]
        },

        {
        title: "3. Data Protection",

        bullets: [
            "Personal data is processed in accordance with our Privacy Policy.",
            "Sensitive information is protected using appropriate security measures.",
            "Access to user information is limited to authorized processes and personnel."
        ]
        },

        {
        title: "4. Infrastructure Security",

        bullets: [
            "Our services are hosted using secure infrastructure.",
            "Communications are protected using encrypted connections (HTTPS).",
            "Security updates are applied regularly.",
            "Access to production systems is restricted."
        ]
        },

        {
        title: "5. Responsible Disclosure",

        content: [
            "If you believe you have discovered a security vulnerability, we encourage you to report it responsibly. We appreciate responsible disclosure and will investigate all legitimate reports."
        ]
        },

        {
        title: "6. Continuous Improvements",

        content: [
            "Security is an ongoing process. We regularly review and improve our infrastructure, software and operational procedures to reduce risks and strengthen platform protection."
        ]
        },

        {
        title: "7. Contact",

        content: [
            "If you need to report a security issue or have security-related questions, please contact us."
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

        title: "Seguridad",

        updated: "2026-06-23",

        intro:
        "En Luranix, la seguridad es una prioridad fundamental. Nos comprometemos a proteger nuestra plataforma, a nuestros usuarios y sus datos aplicando las mejores prácticas del sector y mejorando continuamente nuestras medidas de seguridad.",

        sections: [

        {
            title: "1. Nuestro compromiso con la seguridad",

            content: [
            "Trabajamos de forma continua para mantener un entorno seguro para todos los usuarios mediante la aplicación de estándares modernos de seguridad, monitorización constante y mejoras continuas."
            ]
        },

        {
            title: "2. Seguridad de las cuentas",

            bullets: [
            "Las contraseñas se protegen de forma segura.",
            "Los proveedores de autenticación siguen los estándares de seguridad del sector.",
            "Disponemos de mecanismos de verificación de cuentas y recuperación de contraseñas.",
            "Cada usuario es responsable de mantener la confidencialidad de sus credenciales."
            ]
        },

        {
            title: "3. Protección de datos",

            bullets: [
            "Los datos personales se tratan conforme a nuestra Política de Privacidad.",
            "La información sensible se protege mediante medidas de seguridad adecuadas.",
            "El acceso a la información de los usuarios está limitado a procesos y personal autorizado."
            ]
        },

        {
            title: "4. Seguridad de la infraestructura",

            bullets: [
            "Nuestros servicios se alojan sobre infraestructura segura.",
            "Las comunicaciones están protegidas mediante conexiones cifradas (HTTPS).",
            "Las actualizaciones de seguridad se aplican periódicamente.",
            "El acceso a los sistemas de producción está restringido."
            ]
        },

        {
            title: "5. Divulgación responsable",

            content: [
            "Si crees haber encontrado una vulnerabilidad de seguridad, te animamos a comunicarla de forma responsable. Investigaremos todas las notificaciones legítimas con la máxima prioridad."
            ]
        },

        {
            title: "6. Mejora continua",

            content: [
            "La seguridad es un proceso continuo. Revisamos y mejoramos periódicamente nuestra infraestructura, software y procedimientos para reducir riesgos y reforzar la protección de la plataforma."
            ]
        },

        {
            title: "7. Contacto",

            content: [
            "Si deseas informar sobre un problema de seguridad o tienes cualquier consulta relacionada con la seguridad, puedes ponerte en contacto con nosotros."
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

    title: "Sécurité",

    updated: "2026-06-23",

    intro:
        "Chez Luranix, la sécurité est une priorité essentielle. Nous nous engageons à protéger notre plateforme, nos utilisateurs et leurs données en appliquant les meilleures pratiques du secteur et en améliorant continuellement nos mesures de sécurité.",

    sections: [

        {
        title: "1. Notre engagement en matière de sécurité",

        content: [
            "Nous travaillons en permanence afin de maintenir un environnement sécurisé pour tous les utilisateurs en appliquant des normes de sécurité modernes, une surveillance continue et des améliorations régulières."
        ]
        },

        {
        title: "2. Sécurité des comptes",

        bullets: [
            "Les mots de passe sont protégés de manière sécurisée.",
            "Les fournisseurs d'authentification appliquent les normes de sécurité du secteur.",
            "Des mécanismes de vérification des comptes et de récupération des mots de passe sont disponibles.",
            "Chaque utilisateur est responsable de la confidentialité de ses identifiants."
        ]
        },

        {
        title: "3. Protection des données",

        bullets: [
            "Les données personnelles sont traitées conformément à notre Politique de confidentialité.",
            "Les informations sensibles sont protégées par des mesures de sécurité appropriées.",
            "L'accès aux données des utilisateurs est limité aux processus et au personnel autorisés."
        ]
        },

        {
        title: "4. Sécurité de l'infrastructure",

        bullets: [
            "Nos services sont hébergés sur une infrastructure sécurisée.",
            "Les communications sont protégées par des connexions chiffrées (HTTPS).",
            "Les mises à jour de sécurité sont appliquées régulièrement.",
            "L'accès aux systèmes de production est strictement limité."
        ]
        },

        {
        title: "5. Divulgation responsable",

        content: [
            "Si vous pensez avoir découvert une vulnérabilité de sécurité, nous vous encourageons à nous la signaler de manière responsable. Nous examinerons toutes les signalements légitimes avec la plus grande attention."
        ]
        },

        {
        title: "6. Amélioration continue",

        content: [
            "La sécurité est un processus permanent. Nous révisons et améliorons régulièrement notre infrastructure, nos logiciels et nos procédures afin de réduire les risques et de renforcer la protection de la plateforme."
        ]
        },

        {
        title: "7. Contact",

        content: [
            "Si vous souhaitez signaler un problème de sécurité ou si vous avez des questions concernant la sécurité, veuillez nous contacter."
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

    title: "Sicurezza",

    updated: "2026-06-23",

    intro:
        "In Luranix la sicurezza è una priorità fondamentale. Ci impegniamo a proteggere la nostra piattaforma, i nostri utenti e i loro dati applicando le migliori pratiche del settore e migliorando continuamente le nostre misure di sicurezza.",

    sections: [

        {
        title: "1. Il nostro impegno per la sicurezza",

        content: [
            "Lavoriamo costantemente per mantenere un ambiente sicuro per tutti gli utenti applicando moderni standard di sicurezza, monitoraggio continuo e miglioramenti costanti."
        ]
        },

        {
        title: "2. Sicurezza degli account",

        bullets: [
            "Le password sono protette in modo sicuro.",
            "I provider di autenticazione seguono gli standard di sicurezza del settore.",
            "Sono disponibili procedure di verifica dell'account e recupero della password.",
            "Ogni utente è responsabile della riservatezza delle proprie credenziali."
        ]
        },

        {
        title: "3. Protezione dei dati",

        bullets: [
            "I dati personali sono trattati in conformità con la nostra Informativa sulla privacy.",
            "Le informazioni sensibili sono protette mediante adeguate misure di sicurezza.",
            "L'accesso ai dati degli utenti è limitato ai soli processi e al personale autorizzati."
        ]
        },

        {
        title: "4. Sicurezza dell'infrastruttura",

        bullets: [
            "I nostri servizi sono ospitati su infrastrutture sicure.",
            "Le comunicazioni sono protette mediante connessioni crittografate (HTTPS).",
            "Gli aggiornamenti di sicurezza vengono applicati regolarmente.",
            "L'accesso ai sistemi di produzione è strettamente limitato."
        ]
        },

        {
        title: "5. Divulgazione responsabile",

        content: [
            "Se ritieni di aver individuato una vulnerabilità di sicurezza, ti invitiamo a segnalarcela in modo responsabile. Esamineremo con la massima attenzione tutte le segnalazioni legittime."
        ]
        },

        {
        title: "6. Miglioramento continuo",

        content: [
            "La sicurezza è un processo continuo. Rivediamo e miglioriamo regolarmente la nostra infrastruttura, il software e le procedure operative per ridurre i rischi e rafforzare la protezione della piattaforma."
        ]
        },

        {
        title: "7. Contatti",

        content: [
            "Se desideri segnalare un problema di sicurezza o hai domande relative alla sicurezza, puoi contattarci."
        ],

        contact: {
            label: "E-mail",
            value: "support@luranix.com"
        }
        }

    ]
    },
};