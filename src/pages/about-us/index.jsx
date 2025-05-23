import Head from "next/head";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import { getUserInfo, handleSelectUserLanguage, getInitialStateForElementBeforeAnimation, getAnimationSettings } from "../../../public/global_functions/popular";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import Footer from "@/components/Footer";
import { motion } from "motion/react";

export default function AboutUs() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                    }
                    setIsLoadingPage(false);
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        setIsLoadingPage(false);
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    return (
        <div className="about-us caption-page page">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("About Us")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content text-white ps-4 pe-4 pb-5 pt-5">
                    <div className="container-fluid">
                        <motion.h1
                            className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto"
                            initial={getInitialStateForElementBeforeAnimation()}
                            whileInView={getAnimationSettings}
                        >{t("About Us")}</motion.h1>
                        <div className="content">
                            <motion.p
                                className="mb-4"
                                initial={getInitialStateForElementBeforeAnimation()}
                                whileInView={getAnimationSettings}
                            >{t("We offer high-quality products to our customers. We are committed to meeting your needs and providing the best solutions to ensure your satisfaction .")} .</motion.p>
                            <motion.p
                                className="mb-4"
                                initial={getInitialStateForElementBeforeAnimation()}
                                whileInView={getAnimationSettings}
                            >{t("We feature a wide range of diverse products available at competitive prices. We strive to provide a variety of products to suit your different needs and budgets. We offer high-quality products in various fields such as handicrafts, home and office supplies, household products, and more .")} .</motion.p>
                            <motion.p
                                className="mb-4"
                                initial={getInitialStateForElementBeforeAnimation()}
                                whileInView={getAnimationSettings}
                            >{t("We consider our customers as partners in our success, and we strive to provide high-quality customer service. We pay attention to the smallest details and aim to provide a satisfying shopping experience for our customers .")} .</motion.p>
                            <motion.p
                                className="mb-4"
                                initial={getInitialStateForElementBeforeAnimation()}
                                whileInView={getAnimationSettings}
                            >{t("We are committed to dedicating ourselves to achieving the highest levels of quality and satisfaction for our customers. We strive for innovation and continuous development to meet the changing market demands and continually improve our operations .")} .</motion.p>
                            <motion.p
                                className="mb-0"
                                initial={getInitialStateForElementBeforeAnimation()}
                                whileInView={getAnimationSettings}
                            >{t("We are committed to meeting your needs and achieving your satisfaction, and we are dedicated to achieving sustainable success in our field of work .")} .</motion.p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}