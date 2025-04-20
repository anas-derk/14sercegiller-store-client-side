/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    env: {
        BASE_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:6200" : "https://api.14sercegiller.com",
        WEBSITE_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://14sercegiller.com",
        USER_TOKEN_NAME_IN_LOCAL_STORAGE: "c-s-u-t",
        STORE_NAME: "14 Sercegiller Store",
        USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE: "14sercegiller-store-language",
        USER_ADDRESSES_FIELD_NAME_IN_LOCAL_STORAGE: "14sercegiller-customer-addresses",
        USER_CART_NAME_IN_LOCAL_STORAGE: "14sercegiller-store-customer-cart",
        USER_THEME_MODE_FIELD_NAME_IN_LOCAL_STORAGE: "14sercegiller-store-light-mode",
        REFERAL_WRITER_FIELD_NAME_IN_LOCAL_STORAGE: "14sercegiller-store-referal-writer-info",
        SELECTED_COUNTRY_BY_USER: "14sercegiller-store-country",
        CONTACT_NUMBER: "905374128568",
        CONTACT_EMAIL: "info@14sercegiller.com",
        FACEBOOK_LINK: "https://www.facebook.com/profile.php?id=100076169384054&mibextid=kFxxJD",
        INSTAGRAM_LINK: "https://www.instagram.com/sercegiller?igsh=MTN2dzFuemN4d2QwbQ",
        // X_LINK: "https://x.com/ubuyblues",
        TIKTOK_LINK: "https://www.tiktok.com/@sercegiller?_t=8oeIbUzadU4&_r=1",
        PINTEREST_LINK: "https://pin.it/3ugc4RgFM",
        WEBSITE_NAME: "14 Sercegiller",
        WEBSITE_DASHBOARD_URL: process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://dashboard.sercegiller.com",
        MAIN_COLOR_ONE: "#1b405a"
    },
    async headers() {
        return [
            {
                source: process.env.NODE_ENV === "development" ? "//localhost:6200/(.*)" : "//api.14sercegiller.com/(.*)",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    {
                        key: "Access-Control-Allow-Origin",
                        value: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://14sercegiller.com",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value:
                            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ]
            }
        ];
    }
}

module.exports = nextConfig;