import cnsole from 'loglevel';


const COLOR_1 = "#C08A32";
const COLOR_2 = "#F2ECA0";
const COLOR_3 = "#C08A32";
const gradientBackground = `linear-gradient(to right, ${COLOR_1}, ${COLOR_2}, ${COLOR_3})`;

// Byg brewski
const BYG_BREWSKI_THEME_CONFIG = {
    brandConfig: {
        name: 'Byg Brewski',
    },
    benefitsConfig: {
        backgroundColor: "#0A2040",
        topImg: '/static/byg/treasures.png',
        images: [
            '/static/byg/1.goldenCarpetWelcome.png',
            '/static/byg/2.goldenGlassOnHouse.png',
            '/static/byg/3.gotBeerOnYourMind.png',
            '/static/byg/4.cravingBygIndulgenceAtHome.png',
            '/static/byg/5.lookingToHostAParty.png',
        ],
        dot: {
            selectedBackground: gradientBackground,
            background: '#0A2040',
            borderColor: '#FFFFFF',
        },
        imInterested: {
            text: 'I\'M INTERESTED',
            background: gradientBackground,
        },
        sectionHeights: [0.13, 0.78, 0.09],
    },
    signupConfig: {
        topImg: '/static/byg/treasures.png',
        signupSectionHeights: [0.1, 0.25, 0.4, 0.08],
        otpSectionHeights: [0.1, 0.3, 0.3, 0.08, 0.1],
        textColor: '#FFFFFF',
    },
    notificationConfig: {
        backgroundColor: "#0A2040",
        textColor: '#F2ECA0',
    },
};
const BYG_BREWSKI_OFFERS = {
    '5_DRINKS_1_FREE': 'BUY 5 DRINKS AND GET 1 FREE',
    '2_DRINKS_1_FREE': 'BUY 2 DRINKS AND GET 1 FREE',
    '3_FOOD_1_FREE': 'BUY 3 GET 1 FREE ON FOOD',
    '1_FOOD_1_FREE': 'BUY 1 GET 1 FREE ON FOOD',
    'BYGG_VIR': 'BOW TO THE MIGHTY BYGG VIR',
};
const BYG_BREWSKI_LOYALTY_CONFIG = {
    silver: {
        name: 'silver',
        logo: '/static/byg/bygVirSilver.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A2040",
        benefits: [
            '5_DRINKS_1_FREE',
        ],
        minPointsRequired: 0,
        gradientColors: ["#B5B5B5", "#F9F9F9", "#B5B5B5"],
    },
    gold: {
        name: 'gold',
        logo: '/static/byg/bygvirGold.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A2040",
        benefits: [
            '2_DRINKS_1_FREE',
            '3_FOOD_1_FREE',
        ],
        minPointsRequired: 1000,
        gradientColors: ["#F2ECA0", "#C08A32", "#F2ECA0"],
    },
    platinum: {
        name: 'platinum',
        logo: '/static/byg/bygVirSilver.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A2040",
        benefits: [
            '1_FOOD_1_FREE',
        ],
        minPointsRequired: 10000,
        gradientColors: ["#B5B5B5", "#F9F9F9", "#B5B5B5"],
    },
    god: {
        name: 'god',
        logo: '/static/byg/bygVirSilver.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A2040",
        benefits: [
            'BYGG_VIR',
        ],
        minPointsRequired: 1000000,
        gradientColors: ["#B5B5B5", "#F9F9F9", "#B5B5B5"],
    },
};

// Farzi cafe
const FARZI_CAFE_THEME_CONFIG = {
    brandConfig: {
        name: 'Farzi Cafe',
    },
    benefitsConfig: {
        backgroundColor: "#FFFFFF",
        topImg: '/static/farzi/topImg.png',
        images: [
            '/static/farzi/1.gourmet.png',
            '/static/farzi/2.vision.png',
            '/static/farzi/3.modernist.png',
        ],
        dot: {
            selectedBackground: "#C08A32",
            background: "#F2ECA0",
            borderColor: '#FFFFFF',
        },
        imInterested: {
            text: 'I\'M INTERESTED',
            background: gradientBackground,
        },
        sectionHeights: [0.3, 0.61, 0.09],
    },
    signupConfig: {
        topImg: '/static/farzi/topImg.png',
        textColor: '#000000',
    },
    notificationConfig: {
        backgroundColor: "#000000",
        textColor: '#F2ECA0',
    },
};
const FARZI_CAFE_OFFERS = {
    '5_DRINKS_1_FREE': 'BUY 5 DRINKS AND GET 1 FREE',
    '2_DRINKS_1_FREE': 'BUY 2 DRINKS AND GET 1 FREE',
    '3_FOOD_1_FREE': 'BUY 3 GET 1 FREE ON FOOD',
    '1_FOOD_1_FREE': 'BUY 1 GET 1 FREE ON FOOD',
    'BYGG_VIR': 'BOW TO THE MIGHTY BYGG VIR',
};
const FARZI_CAFE_LOYALTY_CONFIG = {
    silver: {
        name: 'silver',
        logo: '/static/farzi/logo1.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A0A0A",
        benefits: [
            '5_DRINKS_1_FREE',
        ],
        minPointsRequired: 0,
        gradientColors: ["#B5B5B5", "#F9F9F9", "#B5B5B5"],
    },
    gold: {
        name: 'gold',
        logo: '/static/farzi/logo2.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A0A0A",
        benefits: [
            '2_DRINKS_1_FREE',
            '3_FOOD_1_FREE',
        ],
        minPointsRequired: 1000,
        gradientColors: ["#F2ECA0", "#C08A32", "#F2ECA0"],
    },
    platinum: {
        name: 'platinum',
        logo: '/static/farzi/logo3.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A0A0A",
        benefits: [
            '1_FOOD_1_FREE',
        ],
        minPointsRequired: 10000,
        gradientColors: ["#B5B5B5", "#F9F9F9", "#B5B5B5"],
    },
    god: {
        name: 'god',
        logo: '/static/farzi/logo3.png',
        textColor: '#FFFFFF',
        backgroundColor: "#0A0A0A",
        benefits: [
            'BYGG_VIR',
        ],
        minPointsRequired: 1000000,
        gradientColors: ["#B5B5B5", "#F9F9F9", "#B5B5B5"],
    },
};

// Social
const SOCIAL_THEME_CONFIG = {
    brandConfig: {
        name: 'Social',
    },
    benefitsConfig: {
        backgroundColor: "#FFFFFF",
        topImg: '/static/social/topImg.png',
        images: [
            '/static/social/1.eat.png',
            '/static/social/2.drnk.png',
            '/static/social/3.connect.png',
        ],
        dot: {
            selectedBackground: "#C08A32",
            background: "#F2ECA0",
            borderColor: '#FFFFFF',
        },
        imInterested: {
            text: 'I\'M INTERESTED',
            background: gradientBackground,
        },
        sectionHeights: [0.3, 0.61, 0.09],
    },
    signupConfig: {
        topImg: '/static/social/topImg.png',
        textColor: '#000000',
    },
    notificationConfig: {
        backgroundColor: "#000000",
        textColor: '#F2ECA0',
    },
};
const SOCIAL_OFFERS = {
    '5_DRINKS_1_FREE': 'BUY 5 DRINKS AND GET 1 FREE',
    '2_DRINKS_1_FREE': 'BUY 2 DRINKS AND GET 1 FREE',
    '3_FOOD_1_FREE': 'BUY 3 GET 1 FREE ON FOOD',
    '1_FOOD_1_FREE': 'BUY 1 GET 1 FREE ON FOOD',
    'BYGG_VIR': 'BOW TO THE MIGHTY BYGG VIR',
};
const SOCIAL_LOYALTY_CONFIG = {
    silver: {
        name: 'silver',
        logo: '/static/social/logo1.png',
        textColor: '#A0A0A0',
        backgroundColor: "#FFFFFF",
        benefits: [
            '5_DRINKS_1_FREE',
        ],
        minPointsRequired: 0,
        gradientColors: ["#A0A0A0", "#A0A0A0", "#A0A0A0"],
    },
    gold: {
        name: 'gold',
        logo: '/static/social/logo2.png',
        textColor: '#C28E37',
        backgroundColor: "#FFFFFF",
        benefits: [
            '2_DRINKS_1_FREE',
            '3_FOOD_1_FREE',
        ],
        minPointsRequired: 1000,
        gradientColors: ["#C28E37", "#C28E37", "#C28E37"],
    },
    platinum: {
        name: 'platinum',
        logo: '/static/social/logo3.png',
        textColor: '#757575',
        backgroundColor: "#FFFFFF",
        benefits: [
            '1_FOOD_1_FREE',
        ],
        minPointsRequired: 10000,
        gradientColors: ["#757575", "#757575", "#757575"],
    },
    god: {
        name: 'god',
        logo: '/static/social/logo3.png',
        textColor: '#757575',
        backgroundColor: "#FFFFFF",
        benefits: [
            'BYGG_VIR',
        ],
        minPointsRequired: 1000000,
        gradientColors: ["#757575", "#757575", "#757575"],
    },
};

// Happy Brew
const HAPPY_BREW_THEME_CONFIG = {
    brandConfig: {
        name: 'Happy Brew',
    },
    benefitsConfig: {
        textColor: '#FFFFFF',
        backgroundColor: "#000000",
        topImg: '/static/happyBrew/logo1.png',
        images: [{
            img: '/static/happyBrew/7a-Sundays-A-Square-live.png',
            label: 'sun',
            btnColor: '#F65442',
        }, {
            img: '/static/happyBrew/1a-Monday-ladies-night-1.png',
            label: 'mon',
            btnColor: '#65BFFF',
        }, {
            img: '/static/happyBrew/2a-Tuesdays-acoustics-saga.png',
            label: 'tue',
            btnColor: '#E19458',
        }, {
            img: '/static/happyBrew/3a-Wicked-Wednesday.jpg',
            label: 'wed',
            btnColor: '#F4CE07',
        }, {
            img: '/static/happyBrew/4a-Thursday-ladies-night.png',
            label: 'thu',
            btnColor: '#FA9D82',
        }, {
            img: '/static/happyBrew/5a-Friday-bollywood-1.png',
            label: 'fri',
            btnColor: '#DFDD8E',
        }, {
            img: '/static/happyBrew/6a-Saturday-featuring.png',
            label: 'sat',
            btnColor: '#F54FD0',
        }],
        dot: null,
        labels: {
            selectedBackgroundColor: '#FBB017',
            backgroundColor: '#D8D8D8',
        },
        imInterested: {
            text: 'i\'m interested',
        },
        sectionHeights: [0.3, 0.61, 0.09],
    },
    signupConfig: {
        topImg: '/static/happyBrew/happyBrew.jpg',
        textColor: '#FFFFFF',
    },
    notificationConfig: {
        backgroundColor: "#000000",
        textColor: '#F2ECA0',
    },
    guestListConfig: {
        // Tuesday, Wednesday is anyways 0 cover charge
        registerBeforeHr: 19 * 60 + 10,       // Registration for Guest list open till 7 pm (10 mins buffer)
        free: {
            num: 10,
            tnc: [
                '0 Cover Charge - strictly COUPLES only',
                'Valid on entry before 9pm',
            ],
        },
        waitlist: {
            num: 10,
            tnc: [
                'Subject to someone canceling',
                'strictly COUPLES only',
                'Valid on entry before 9pm',
            ],
        },
    },
};
const HAPPY_BREW_OFFERS = {
    '10_DRINKS_1_FREE': 'BUY 10 DRINKS AND GET 1 FREE',
    '5_DRINKS_1_FREE': 'BUY 5 DRINKS AND GET 1 FREE',
    '1_FOOD_1_FREE': 'BUY 1 GET 1 FREE ON FOOD',
};
const HAPPY_BREW_LOYALTY_CONFIG = {
    silver: {
        name: 'silver',
        logo: '/static/happyBrew/happyBrew.jpg',
        textColor: '#A0A0A0',
        backgroundColor: "#000000",
        benefits: [
            '10_DRINKS_1_FREE',
        ],
        minPointsRequired: 0,
        gradientColors: ["#A0A0A0", "#A0A0A0", "#A0A0A0"],
        guestListEnabled: true,
    },
    gold: {
        name: 'gold',
        logo: '/static/happyBrew/happyBrew.jpg',
        textColor: '#C28E37',
        backgroundColor: "#000000",
        benefits: [
            '5_DRINKS_1_FREE',
        ],
        minPointsRequired: 1000,
        gradientColors: ["#C28E37", "#C28E37", "#C28E37"],
        guestListEnabled: true,
    },
    platinum: {
        name: 'platinum',
        logo: '/static/happyBrew/happyBrew.jpg',
        textColor: '#757575',
        backgroundColor: "#000000",
        benefits: [
            '1_FOOD_1_FREE',
        ],
        minPointsRequired: 100000,
        gradientColors: ["#757575", "#757575", "#757575"],
        guestListEnabled: true,
    },
};


export const ESTABLISHMENT_LOYALTY_THEME_CONFIG = {
    1: BYG_BREWSKI_THEME_CONFIG,
    2: FARZI_CAFE_THEME_CONFIG,
    3: SOCIAL_THEME_CONFIG,
    4: HAPPY_BREW_THEME_CONFIG,
};
export const ESTABLISHMENT_OFFERS_CONFIG = {
    1: BYG_BREWSKI_OFFERS,
    2: FARZI_CAFE_OFFERS,
    3: SOCIAL_OFFERS,
    4: HAPPY_BREW_OFFERS,
};
export const ESTABLISHMENT_LOYALTY_CONFIG = {
    1: BYG_BREWSKI_LOYALTY_CONFIG,
    2: FARZI_CAFE_LOYALTY_CONFIG,
    3: SOCIAL_LOYALTY_CONFIG,
    4: HAPPY_BREW_LOYALTY_CONFIG,
};

export const getLoyaltyConfigs = async (establishmentId) => {
    cnsole.log('Getting configs for establishment: ', establishmentId);
    const loyaltyConfig = ESTABLISHMENT_LOYALTY_CONFIG[establishmentId];
    const offers = ESTABLISHMENT_OFFERS_CONFIG[establishmentId];
    const themeConfig = ESTABLISHMENT_LOYALTY_THEME_CONFIG[establishmentId];

    const obj = { loyaltyConfig, offers, themeConfig };
    cnsole.log('Returning config: ', obj);
    return obj;
};

export const allEstablishmentIds = async () => {
    return Object.keys(ESTABLISHMENT_LOYALTY_CONFIG);
};

export const GUEST_LIST_STATUS_FAILURE = 'failure';
export const GUEST_LIST_STATUS_CONFIRMED = 'confirmed';
export const GUEST_LIST_STATUS_WAITLIST = 'waitlist';
export const GUEST_LIST_STATUS_FULL = 'full';
export const GUEST_LIST_STATUS_CLOSED = 'closed';
