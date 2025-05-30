import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../../public/global_functions/popular";
import { motion } from "motion/react";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function CustomerAccountDetails() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [userInfo, setUserInfo] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        previewName: "",
    });

    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isVisibleCurrentPassword, setIsVisibleCurrentPassword] = useState(false);

    const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);

    const [isVisibleConfirmNewPassword, setIsVisibleConfirmNewPassword] = useState(false);

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
        if (userToken) {
            getUserInfo()
                .then(async (result) => {
                    if (!result.error) {
                        setUserInfo(result.data);
                        setIsLoadingPage(false);
                    } else {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        await router.replace("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        await router.replace("/auth");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            router.replace("/auth");
        }
    }, []);

    const updateUserInfo = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "firstName",
                    value: userInfo.firstName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "lastName",
                    value: userInfo.lastName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "previewName",
                    value: userInfo.previewName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "email",
                    value: userInfo.email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
                (newPassword || confirmNewPassword) ? {
                    name: "currentPassword",
                    value: currentPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    }
                } : null,
                (currentPassword || confirmNewPassword) ? {
                    name: "newPassword",
                    value: newPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isMatch: {
                            value: confirmNewPassword,
                            msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    }
                } : null,
                (currentPassword || newPassword) ? {
                    name: "confirmNewPassword",
                    value: confirmNewPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isMatch: {
                            value: newPassword,
                            msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    }
                } : null,
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                let newUserInfo = {
                    email: userInfo.email,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    previewName: userInfo.previewName,
                };
                if (currentPassword && newPassword && confirmNewPassword) {
                    newUserInfo = { ...newUserInfo, password: currentPassword, newPassword: newPassword };
                }
                setIsWaitStatus(true);
                const result = (await axios.put(`${process.env.BASE_API_URL}/users/update-user-info?language=${i18n.language}`, newUserInfo, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE),
                    }
                })).data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        clearTimeout(successTimeout);
                    }, 2000);
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        clearTimeout(errorTimeout);
                    }, 2000);
                }
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                await router.replace("/auth");
            }
            else {
                setIsWaitStatus(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeat The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="customer-account-details customer-dashboard">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("Customer Account Info")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid align-items-center pb-4">
                        <div className="row">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                <form className="edit-customer-account-details-form p-4" onSubmit={updateUserInfo}>
                                    <section className="first-and-last-name mb-4">
                                        <div className="row">
                                            <motion.div className="col-md-6" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <h6>{t("First Name")} <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.firstName ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New First Name Here")}
                                                    defaultValue={userInfo.firstName}
                                                    onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value.trim() })}
                                                />
                                                {formValidationErrors.firstName && <FormFieldErrorBox errorMsg={t(formValidationErrors.firstName)} />}
                                            </motion.div>
                                            <motion.div className="col-md-6" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <h6>{t("Last Name")} <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.lastName ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder={t("Please Enter New Last Name Here")}
                                                    defaultValue={userInfo.lastName}
                                                    onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value.trim() })}
                                                />
                                                {formValidationErrors.lastName && <FormFieldErrorBox errorMsg={t(formValidationErrors.lastName)} />}
                                            </motion.div>
                                        </div>
                                    </section>
                                    <motion.section className="preview-name mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Preview Name")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.previewName ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Preview Name Here")}
                                            defaultValue={userInfo.previewName}
                                            onChange={(e) => setUserInfo({ ...userInfo, previewName: e.target.value.trim() })}
                                        />
                                        {formValidationErrors.previewName && <FormFieldErrorBox errorMsg={t(formValidationErrors.previewName)} />}
                                        <h6 className="note mt-2">{t("This way your name will be displayed in the accounts section and in reviews")}</h6>
                                    </motion.section>
                                    <motion.section className="email mb-4" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                        <h6>{t("Email")} <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.email ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder={t("Please Enter New Email Here")}
                                            defaultValue={userInfo.email}
                                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value.trim() })}
                                        />
                                        {formValidationErrors.email && <FormFieldErrorBox errorMsg={t(formValidationErrors.email)} />}
                                    </motion.section>
                                    <section className="change-password mb-4">
                                        <fieldset>
                                            <motion.section className="current-password mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <h6>{t("Current password")} ({t("leave the field blank if you do not want to change it")})</h6>
                                                <div className={`current-password-field-box ${formValidationErrors.currentPassword ? "error-in-field" : ""}`}>
                                                    <input
                                                        type={isVisibleCurrentPassword ? "text" : "password"}
                                                        className={`p-2 ${formValidationErrors.currentPassword ? "border-3 border-danger mb-3" : ""}`}
                                                        onChange={(e) => setCurrentPassword(e.target.value.trim())}
                                                    />
                                                    <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                        {!isVisibleCurrentPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                                        {isVisibleCurrentPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                                    </div>
                                                </div>
                                                {formValidationErrors.currentPassword && <FormFieldErrorBox errorMsg={t(formValidationErrors.currentPassword)} />}
                                            </motion.section>
                                            <motion.section className="new-password mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <h6>{t("New password")} ({t("leave the field blank if you do not want to change it")})</h6>
                                                <div className={`new-password-field-box ${formValidationErrors.newPassword ? "error-in-field" : ""}`}>
                                                    <input
                                                        type={isVisibleNewPassword ? "text" : "password"}
                                                        className={`p-2 ${formValidationErrors.newPassword ? "border-3 border-danger mb-3" : ""}`}
                                                        onChange={(e) => setNewPassword(e.target.value.trim())}
                                                    />
                                                    <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                        {!isVisibleNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                                        {isVisibleNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                                    </div>
                                                </div>
                                                {formValidationErrors.newPassword && <FormFieldErrorBox errorMsg={t(formValidationErrors.newPassword)} />}
                                            </motion.section>
                                            <motion.section className="confirm-new-password mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                                <h6>{t("Confirm New password")} ({t("leave the field blank if you do not want to change it")})</h6>
                                                <div className={`confirm-new-password-field-box ${formValidationErrors.confirmNewPassword ? "error-in-field" : ""}`}>
                                                    <input
                                                        type={isVisibleConfirmNewPassword ? "text" : "password"}
                                                        className={`p-2 ${formValidationErrors.confirmNewPassword ? "border-3 border-danger mb-3" : ""}`}
                                                        onChange={(e) => setConfirmNewPassword(e.target.value.trim())}
                                                    />
                                                    <div className={`icon-box ${i18n.language === "ar" ? "ar-language-mode" : "other-languages-mode"}`}>
                                                        {!isVisibleConfirmNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                                        {isVisibleConfirmNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                                    </div>
                                                </div>
                                                {formValidationErrors.confirmNewPassword && <FormFieldErrorBox errorMsg={t(formValidationErrors.confirmNewPassword)} />}
                                            </motion.section>
                                        </fieldset>
                                    </section>
                                    {!isWaitStatus && !successMsg && !errorMsg && <motion.button
                                        type="submit"
                                        className="btn btn-success d-block mx-auto"
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t("Save Changes")}
                                    </motion.button>}
                                    {isWaitStatus && <motion.button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t("Saving")} ...
                                    </motion.button>}
                                    {errorMsg && <motion.button
                                        className="btn btn-danger d-block mx-auto"
                                        disabled
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t(errorMsg)}
                                    </motion.button>}
                                    {successMsg && <motion.button
                                        className="btn btn-success d-block mx-auto"
                                        disabled
                                        initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                                    >
                                        {t(successMsg)}
                                    </motion.button>}
                                </form>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}