import Head from "next/head";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiSolidUser } from "react-icons/bi";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { GoogleLogin } from '@react-oauth/google';
import { decode } from "jsonwebtoken";
import Footer from "@/components/Footer";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function UserAuth() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [appearedAuthPartName, setAppearedAuthPartName] = useState("login");

    const [emailForLogin, setEmailForLogin] = useState("");

    const [passwordForLogin, setPasswordForLogin] = useState("");

    const [isLoginingStatus, setIsLoginingStatus] = useState(false);

    const [emailForSignup, setEmailForSignup] = useState("");

    const [passwordForSignup, setPasswordForSignup] = useState("");

    const [isSignupStatus, setIsSignupStatus] = useState(false);

    const [errMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isVisiblePasswordForLogin, setIsVisiblePasswordForLogin] = useState(false);

    const [isVisiblePasswordForSignup, setIsVisiblePasswordForSignup] = useState(false);

    const { t, i18n } = useTranslation();

    const router = useRouter();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
        if (userToken) {
            getUserInfo()
                .then(async (res) => {
                    const result = res.data;
                    if (!result.error) {
                        await router.replace("/");
                    } else {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        setIsLoadingPage(false);
                    }
                }).catch((err) => {
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

    const userLogin = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            setErrorMsg("");
            setSuccessMsg("");
            const errorsObject = inputValuesValidation([
                {
                    name: "emailForLogin",
                    value: emailForLogin,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, This Email Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "passwordForLogin",
                    value: passwordForLogin,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsLoginingStatus(true);
                const result = (await axios.get(`${process.env.BASE_API_URL}/users/login?email=${emailForLogin}&password=${encodeURIComponent(passwordForLogin)}&language=${i18n.language}`)).data;
                if (result.error) {
                    setIsLoginingStatus(false);
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 5000);
                } else {
                    if (result.data.isVerified) {
                        localStorage.setItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE, result.data.token);
                        await router.replace("/");
                    } else await router.replace(`/account-verification?email=${emailForLogin}`);
                }
            }
        }
        catch (err) {
            setIsLoginingStatus(false);
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 5000);
        }
    }

    const userSignup = async (e) => {
        try {
            e.preventDefault();
            setErrorMsg("");
            setSuccessMsg("");
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "emailForSignup",
                    value: emailForSignup,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, This Email Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "passwordForSignup",
                    value: passwordForSignup,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsSignupStatus(true);
                const result = (await axios.post(`${process.env.BASE_API_URL}/users/create-new-user?language=${i18n.language}`, {
                    email: emailForSignup,
                    password: encodeURIComponent(passwordForSignup),
                    language: i18n.language
                })).data;
                setIsSignupStatus(false);
                if (result.error) {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                } else {
                    setSuccessMsg(`${result.msg}, Please Wait To Navigate To Verification Page !!`);
                    let successTimeout = setTimeout(async () => {
                        await router.push(`/account-verification?email=${emailForSignup}`);
                        clearTimeout(successTimeout);
                    }, 6000);
                }
            }
        }
        catch (err) {
            setIsSignupStatus(false);
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 5000);
        }
    }

    const authWithGoogle = async (credentialResponse, authType) => {
        try {
            if (authType === "sign-up") setIsSignupStatus(true);
            else setIsLoginingStatus(true);
            let result = decode(credentialResponse.credential);
            result = (await axios.get(`${process.env.BASE_API_URL}/users/login-with-google?email=${result.email}&firstName=${result.given_name}&lastName=${result.family_name}&previewName=${result.name}&language=${i18n.language}`)).data;
            if (result.error) {
                if (authType === "sign-up") setIsSignupStatus(true);
                else setIsLoginingStatus(true);
                setErrorMsg(result.msg);
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 5000);
            } else {
                localStorage.setItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE, result.data.token);
                await router.replace("/");
            }
        }
        catch (err) {
            if (authType === "sign-up") setIsSignupStatus(true);
            else setIsLoginingStatus(true);
            setErrorMsg("Sorry, Someting Went Wrong, Please Try Again The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 5000);
        }
    }

    const loginingFailedWithGoogle = (err) => {
        alert("Login Failed With Google, Please Repeate The Process !!");
    }

    return (
        <div className="auth page">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("User Auth")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content">
                    <div className="container-fluid p-4 text-white text-center">
                        <motion.section className="auth-part-display-control mb-5" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                            <h4
                                className="m-0 display-login-btn display-btn p-3"
                                onClick={() => setAppearedAuthPartName("login")}
                            >
                                {t("login")}
                            </h4>
                            <h4
                                className="m-0 display-signup-btn display-btn p-3"
                                onClick={() => setAppearedAuthPartName("sign-up")}
                            >
                                {t("sign-up")}
                            </h4>
                        </motion.section>
                        <section className="authentication">
                            <div className="row">
                                {appearedAuthPartName === "sign-up" && <div className="col-md-12">
                                    <div className="signup-section">
                                        <h5 className="part-name mb-4">{t("Create New Account")}</h5>
                                        <motion.form className="user-signup-form mb-3" onSubmit={userSignup} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className="email-field-box">
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter Your Email")}
                                                    className={`form-control ${formValidationErrors["emailForSignup"] ? "border-danger mb-3" : "mb-5"}`}
                                                    onChange={(e) => setEmailForSignup(e.target.value.trim())}
                                                />
                                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                    <BiSolidUser className="icon" />
                                                </div>
                                            </div>
                                            {formValidationErrors["emailForSignup"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["emailForSignup"])} />}
                                            <div className="password-field-box">
                                                <input
                                                    type={isVisiblePasswordForSignup ? "text" : "password"}
                                                    placeholder={t("Please Enter Your Password")}
                                                    className={`form-control ${formValidationErrors["passwordForSignup"] ? "border-danger mb-3" : "mb-5"}`}
                                                    onChange={(e) => setPasswordForSignup(e.target.value.trim())}
                                                />
                                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                    {!isVisiblePasswordForSignup && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePasswordForSignup(value => value = !value)} />}
                                                    {isVisiblePasswordForSignup && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePasswordForSignup(value => value = !value)} />}
                                                </div>
                                            </div>
                                            {formValidationErrors["passwordForSignup"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["passwordForSignup"])} />}
                                            {!isSignupStatus && !errMsg && !successMsg && <button type="submit" className="btn btn-success w-100 mb-4 global-button">
                                                {i18n.language === "ar" && <FiLogIn />}
                                                <span className="me-2">{t("sign-up")}</span>
                                                {i18n.language !== "ar" && <FiLogIn />}
                                            </button>}
                                            {isSignupStatus && <button disabled className="btn btn-primary w-100 mb-4 global-button">
                                                <span className="me-2">{t("Wait Signup")} ...</span>
                                            </button>}
                                            {(errMsg || successMsg) && <p className={`global-button text-center text-white text-start mb-5 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{t(errMsg || successMsg)}</p>}
                                            <h6 className="fw-bold mb-4">{t("Or Sign Up With")}</h6>
                                            <ul className="external-auth-sites-list">
                                                <li className="external-auth-site-item">
                                                    <GoogleLogin
                                                        type="icon"
                                                        onSuccess={(credentialResponse) => authWithGoogle(credentialResponse, "sign-up")}
                                                        onError={loginingFailedWithGoogle}
                                                    />
                                                </li>
                                            </ul>
                                        </motion.form>
                                    </div>
                                </div>}
                                {appearedAuthPartName === "login" && <div className="col-md-12">
                                    <div className="login-section">
                                        <h5 className="part-name mb-4">{t("login")}</h5>
                                        <motion.form className="user-login-form mb-3" onSubmit={userLogin} initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                            <div className="email-field-box">
                                                <input
                                                    type="text"
                                                    placeholder={t("Please Enter Your Email")}
                                                    className={`form-control ${formValidationErrors["emailForLogin"] ? "border-danger mb-4" : "mb-5"}`}
                                                    onChange={(e) => setEmailForLogin(e.target.value.trim())}
                                                />
                                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                    <BiSolidUser className="icon" />
                                                </div>
                                            </div>
                                            {formValidationErrors["emailForLogin"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["emailForLogin"])} />}
                                            <div className="password-field-box">
                                                <input
                                                    type={isVisiblePasswordForLogin ? "text" : "password"}
                                                    placeholder={t("Please Enter Your Password")}
                                                    className={`form-control ${formValidationErrors["passwordForLogin"] ? "border-danger mb-4" : "mb-5"}`}
                                                    onChange={(e) => setPasswordForLogin(e.target.value.trim())}
                                                />
                                                <div className={`icon-box text-dark ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                    {!isVisiblePasswordForLogin && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePasswordForLogin(value => value = !value)} />}
                                                    {isVisiblePasswordForLogin && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePasswordForLogin(value => value = !value)} />}
                                                </div>
                                            </div>
                                            {formValidationErrors["passwordForLogin"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["passwordForLogin"])} />}
                                            {!isLoginingStatus && !errMsg && !successMsg && <button type="submit" className="btn btn-success w-100 mb-4 global-button">
                                                {i18n.language === "ar" && <FiLogIn />}
                                                <span className="me-2">{t("login")}</span>
                                                {i18n.language !== "ar" && <FiLogIn />}
                                            </button>}
                                            {isLoginingStatus && <button disabled className="btn btn-primary w-100 mb-4 global-button">
                                                <span className="me-2">{t("Wait Logining")} ...</span>
                                            </button>}
                                            {(errMsg || successMsg) && <p className={`global-button text-center text-white text-start mb-5 alert ${errMsg ? "alert-danger bg-danger" : ""} ${successMsg ? "alert-success bg-success" : ""}`}>{t(errMsg || successMsg)}</p>}
                                            <h6 className="fw-bold mb-4">{t("Or Sign In With")}</h6>
                                            <ul className="external-auth-sites-list">
                                                <li className="external-auth-site-item">
                                                    <GoogleLogin
                                                        type="icon"
                                                        onSuccess={(credentialResponse) => authWithGoogle(credentialResponse, "login")}
                                                        onError={loginingFailedWithGoogle}
                                                    />
                                                </li>
                                            </ul>
                                        </motion.form>
                                        <Link href="/forget-password?userType=user" className="text-white border-bottom border-2 pb-2 forget-password-link-btn">{t("forget password").toUpperCase()}</Link>
                                    </div>
                                </div>}
                            </div>
                        </section>
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}