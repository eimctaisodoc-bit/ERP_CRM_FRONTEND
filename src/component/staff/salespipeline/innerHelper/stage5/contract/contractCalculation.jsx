import React, { useEffect, useState } from 'react';
import { useGet } from '../../../../../hooks/useGet';

const MAX_TOTAL_MONTHS = 36;
const VAT_RATE = 0.13;

const npMonths = [
    "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const pricingData = [
    { headCount: 500, perMonthCharge: 18835.00, oneYear: 226020.00, threeYears: 678060.00, beforeVAT: 678060.00, vat: 88147.80, afterVAT: 766207.80, downPayment: 306483.12, year1: 229862.34, year2: 153241.56, year3: 76620.78, total: 766207.80 },
    { headCount: 550, perMonthCharge: 20718.50, oneYear: 248622.00, threeYears: 745866.00, beforeVAT: 745866.00, vat: 96962.58, afterVAT: 842828.58, downPayment: 337131.43, year1: 252848.57, year2: 168565.72, year3: 84282.86, total: 842828.58 },
    { headCount: 600, perMonthCharge: 22602.00, oneYear: 271224.00, threeYears: 813672.00, beforeVAT: 813672.00, vat: 105777.36, afterVAT: 919449.36, downPayment: 367779.74, year1: 275834.81, year2: 183889.87, year3: 91944.94, total: 919449.36 },
    { headCount: 650, perMonthCharge: 24485.50, oneYear: 293826.00, threeYears: 881478.00, beforeVAT: 881478.00, vat: 114592.14, afterVAT: 996070.14, downPayment: 398428.06, year1: 298821.04, year2: 199214.03, year3: 99607.01, total: 996070.14 },
    { headCount: 700, perMonthCharge: 26369.00, oneYear: 316428.00, threeYears: 949284.00, beforeVAT: 949284.00, vat: 123406.92, afterVAT: 1072690.92, downPayment: 429076.37, year1: 321807.28, year2: 214538.18, year3: 107269.09, total: 1072690.92 },
    { headCount: 750, perMonthCharge: 28252.50, oneYear: 339030.00, threeYears: 1017090.00, beforeVAT: 1017090.00, vat: 132221.70, afterVAT: 1149311.70, downPayment: 459724.68, year1: 344793.51, year2: 229862.34, year3: 114931.17, total: 1149311.70 },
    { headCount: 800, perMonthCharge: 30136.00, oneYear: 361632.00, threeYears: 1084896.00, beforeVAT: 1084896.00, vat: 141036.48, afterVAT: 1225932.48, downPayment: 484243.33, year1: 367779.74, year2: 251316.16, year3: 122593.25, total: 1225932.48 },
    { headCount: 850, perMonthCharge: 32019.50, oneYear: 384234.00, threeYears: 1152702.00, beforeVAT: 1152702.00, vat: 149851.26, afterVAT: 1302553.26, downPayment: 507995.77, year1: 390765.98, year2: 273536.18, year3: 130255.33, total: 1302553.26 },
    { headCount: 900, perMonthCharge: 33903.00, oneYear: 406836.00, threeYears: 1220508.00, beforeVAT: 1220508.00, vat: 158666.04, afterVAT: 1379174.04, downPayment: 530982.01, year1: 413752.21, year2: 296522.42, year3: 137917.40, total: 1379174.04 },
    { headCount: 950, perMonthCharge: 35786.50, oneYear: 429438.00, threeYears: 1288314.00, beforeVAT: 1288314.00, vat: 167480.82, afterVAT: 1455794.82, downPayment: 553202.03, year1: 436738.45, year2: 320274.86, year3: 145579.48, total: 1455794.82 },
    { headCount: 1000, perMonthCharge: 37670.00, oneYear: 452040.00, threeYears: 1356120.00, beforeVAT: 1356120.00, vat: 176295.60, afterVAT: 1532415.60, downPayment: 574655.85, year1: 459724.68, year2: 344793.51, year3: 153241.56, total: 1532415.60 },
    { headCount: 1050, perMonthCharge: 39553.50, oneYear: 474642.00, threeYears: 1423926.00, beforeVAT: 1423926.00, vat: 185110.38, afterVAT: 1609036.38, downPayment: 595343.46, year1: 482710.91, year2: 370078.37, year3: 160903.64, total: 1609036.38 },
    { headCount: 1100, perMonthCharge: 41437.00, oneYear: 497244.00, threeYears: 1491732.00, beforeVAT: 1491732.00, vat: 193925.16, afterVAT: 1685657.16, downPayment: 615264.86, year1: 505697.15, year2: 396129.43, year3: 168565.72, total: 1685657.16 },
    { headCount: 1150, perMonthCharge: 43320.50, oneYear: 519846.00, threeYears: 1559538.00, beforeVAT: 1559538.00, vat: 202739.94, afterVAT: 1762277.94, downPayment: 634420.06, year1: 528683.38, year2: 422946.71, year3: 176227.79, total: 1762277.94 },
    { headCount: 1200, perMonthCharge: 45204.00, oneYear: 542448.00, threeYears: 1627344.00, beforeVAT: 1627344.00, vat: 211554.72, afterVAT: 1838898.72, downPayment: 652809.05, year1: 551669.62, year2: 450530.19, year3: 183889.87, total: 1838898.72 },
    { headCount: 1250, perMonthCharge: 47087.50, oneYear: 565050.00, threeYears: 1695150.00, beforeVAT: 1695150.00, vat: 220369.50, afterVAT: 1915519.50, downPayment: 670431.83, year1: 574655.85, year2: 478879.88, year3: 191551.95, total: 1915519.50 },
    { headCount: 1300, perMonthCharge: 48971.00, oneYear: 587652.00, threeYears: 1762956.00, beforeVAT: 1762956.00, vat: 229184.28, afterVAT: 1992140.28, downPayment: 687288.40, year1: 597642.08, year2: 507995.77, year3: 199214.03, total: 1992140.28 },
    { headCount: 1350, perMonthCharge: 50854.50, oneYear: 610254.00, threeYears: 1830762.00, beforeVAT: 1830762.00, vat: 237999.06, afterVAT: 2068761.06, downPayment: 703378.76, year1: 620628.32, year2: 537877.88, year3: 206876.11, total: 2068761.06 },
    { headCount: 1400, perMonthCharge: 52738.00, oneYear: 632856.00, threeYears: 1898568.00, beforeVAT: 1898568.00, vat: 246813.84, afterVAT: 2145381.84, downPayment: 718702.92, year1: 643614.55, year2: 568526.19, year3: 214538.18, total: 2145381.84 },
    { headCount: 1450, perMonthCharge: 54621.50, oneYear: 655458.00, threeYears: 1966374.00, beforeVAT: 1966374.00, vat: 255628.62, afterVAT: 2222002.62, downPayment: 733260.86, year1: 666600.79, year2: 599940.71, year3: 222200.26, total: 2222002.62 },
    { headCount: 1500, perMonthCharge: 56505.00, oneYear: 678060.00, threeYears: 2034180.00, beforeVAT: 2034180.00, vat: 264443.40, afterVAT: 2298623.40, downPayment: 747052.61, year1: 689587.02, year2: 632121.44, year3: 229862.34, total: 2298623.40 },
    { headCount: 1550, perMonthCharge: 58388.50, oneYear: 700662.00, threeYears: 2101986.00, beforeVAT: 2101986.00, vat: 273258.18, afterVAT: 2375244.18, downPayment: 760078.14, year1: 712573.25, year2: 665068.37, year3: 237524.42, total: 2375244.18 },
    { headCount: 1600, perMonthCharge: 60272.00, oneYear: 723264.00, threeYears: 2169792.00, beforeVAT: 2169792.00, vat: 282072.96, afterVAT: 2451864.96, downPayment: 772337.46, year1: 735559.49, year2: 698781.51, year3: 245186.50, total: 2451864.96 },
    { headCount: 1650, perMonthCharge: 62155.50, oneYear: 745866.00, threeYears: 2237598.00, beforeVAT: 2237598.00, vat: 290887.74, afterVAT: 2528485.74, downPayment: 783830.58, year1: 758545.72, year2: 733260.86, year3: 252848.57, total: 2528485.74 },
    { headCount: 1700, perMonthCharge: 64039.00, oneYear: 768468.00, threeYears: 2305404.00, beforeVAT: 2305404.00, vat: 299702.52, afterVAT: 2605106.52, downPayment: 794557.49, year1: 781531.96, year2: 768506.42, year3: 260510.65, total: 2605106.52 },
    { headCount: 1750, perMonthCharge: 65922.50, oneYear: 791070.00, threeYears: 2373210.00, beforeVAT: 2373210.00, vat: 308517.30, afterVAT: 2681727.30, downPayment: 804518.19, year1: 804518.19, year2: 804518.19, year3: 268172.73, total: 2681727.30 },
    { headCount: 1800, perMonthCharge: 67806.00, oneYear: 813672.00, threeYears: 2441016.00, beforeVAT: 2441016.00, vat: 317332.08, afterVAT: 2758348.08, downPayment: 813712.68, year1: 827504.42, year2: 841296.16, year3: 275834.81, total: 2758348.08 },
    { headCount: 1850, perMonthCharge: 69689.50, oneYear: 836274.00, threeYears: 2508822.00, beforeVAT: 2508822.00, vat: 326146.86, afterVAT: 2834968.86, downPayment: 822140.97, year1: 850490.66, year2: 878840.35, year3: 283496.89, total: 2834968.86 },
    { headCount: 1900, perMonthCharge: 71573.00, oneYear: 858876.00, threeYears: 2576628.00, beforeVAT: 2576628.00, vat: 334961.64, afterVAT: 2911589.64, downPayment: 829803.05, year1: 873476.89, year2: 917150.74, year3: 291158.96, total: 2911589.64 },
    { headCount: 1950, perMonthCharge: 73456.50, oneYear: 881478.00, threeYears: 2644434.00, beforeVAT: 2644434.00, vat: 343776.42, afterVAT: 2988210.42, downPayment: 836698.92, year1: 896463.13, year2: 956227.33, year3: 298821.04, total: 2988210.42 },
    { headCount: 2000, perMonthCharge: 75340.00, oneYear: 904080.00, threeYears: 2712240.00, beforeVAT: 2712240.00, vat: 352591.20, afterVAT: 3064831.20, downPayment: 842828.58, year1: 919449.36, year2: 996070.14, year3: 306483.12, total: 3064831.20 }
];

// Helper to format ordinals (1st, 2nd, 3rd, 4th, etc.)
const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const calculateSchedule = (totalInstallments, downPayment, basePrice, startDateString, others, userInput, Documetation, isoCertification, Erp) => {
    let schedule = [];

    const fixedIndices = [10, 11].filter(n => n <= totalInstallments);
    const fixedCount = fixedIndices.length;
    const remainingInstallments = totalInstallments - fixedCount;
    const flexibleGap = remainingInstallments > 0 ? (MAX_TOTAL_MONTHS - fixedCount) / remainingInstallments : 0;

    const rawStartDate = userInput?.[0]?.date || startDateString;

    // Default Fallback Values
    let startYearBS = 2081;
    let startMonthStr = "01";
    let startDayStr = "01";
    let startMonthIdxBS = 0;

    if (rawStartDate) {
        const dateParts = String(rawStartDate).split('T')[0].split(/[-/]/);

        if (dateParts.length >= 3) {
            if (parseInt(dateParts[0], 10) > 1000) {
                startYearBS = parseInt(dateParts[0], 10);
                startMonthStr = dateParts[1].padStart(2, '0');
                startDayStr = dateParts[2].padStart(2, '0');
                startMonthIdxBS = parseInt(dateParts[1], 10) - 1;
            } else {
                startYearBS = parseInt(dateParts[2], 10);
                startMonthStr = dateParts[1].padStart(2, '0');
                startDayStr = dateParts[0].padStart(2, '0');
                startMonthIdxBS = parseInt(dateParts[1], 10) - 1;
            }
        }
    }

    const formattedStartDate = `${startYearBS}-${startMonthStr}-${startDayStr}`;
    const endYearBS = startYearBS + 3;
    const expectedEndDate = `${endYearBS}-${startMonthStr}-${startDayStr}`;

    // Helper to get month and year based on an offset from start date
    const getMonthYearString = (offset) => {
        const totalMonthValue = startMonthIdxBS + offset;
        const year = startYearBS + Math.floor(totalMonthValue / 12);
        const monthIdx = ((totalMonthValue % 12) + 12) % 12;
        return { monthName: npMonths[monthIdx], year };
    };

    let runningTotalPercent = 0;
    let accumulatedMonths = 0;

    const discountApplied = Number(userInput?.[0]?.discounted || 0);
    const installmentPercent = totalInstallments > 0 ? parseFloat(((100 - downPayment) / totalInstallments).toFixed(2)) : 0;

    const totalDiscountAmount = (discountApplied / 100) * basePrice;
    const priceAfterDiscount = basePrice - totalDiscountAmount;

    const downpaymentBeforeDiscount = (downPayment / 100) * basePrice;
    const downpaymentAfterDiscount = ((downPayment - discountApplied) / 100) * basePrice;

    for (let i = 1; i <= totalInstallments + 1; i++) {
        let percent;
        let remark = "";
        let currentStepGap = 0;
        let startSpan = 0;
        let endSpan = 0;

        if (i === 1) {
            percent = downPayment - discountApplied;
            remark = "Downpayment";
            accumulatedMonths = 0;
            startSpan = 0;
            endSpan = 0;
        } else {
            const instIndex = i - 1;
            const prevAccumulated = Math.round(accumulatedMonths);

            percent = (i === totalInstallments + 1)
                ? parseFloat((100 - runningTotalPercent).toFixed(2))
                : installmentPercent;

            remark = (i === totalInstallments + 1)
                ? `Installment ${instIndex} (Final)`
                : `Installment ${instIndex}`;

            if (instIndex === 1) {
                currentStepGap = 1;
            } else {
                currentStepGap = [10, 11].includes(instIndex) ? 1 : flexibleGap;
            }

            accumulatedMonths += currentStepGap;

            if (i === totalInstallments + 1) accumulatedMonths = MAX_TOTAL_MONTHS;

            startSpan = prevAccumulated + 1; // Covers the gap *after* the last installment
            endSpan = Math.round(accumulatedMonths);
        }

        let displayMonthStr = "";
        let monthStr = "";

        if (i === 1) {
            displayMonthStr = "Immediate";
            const my = getMonthYearString(0);
            monthStr = `${my.monthName}-${my.year}`;
        } else {
            if (startSpan >= endSpan) { // Handles single-month installments
                displayMonthStr = `${getOrdinal(endSpan)} Month`;
                const my = getMonthYearString(endSpan);
                monthStr = `${my.monthName}-${my.year}`;
            } else { // Handles range logic for multi-month installment gaps
                displayMonthStr = `${getOrdinal(startSpan)} / ${getOrdinal(endSpan)} Month`;
                
                const startMY = getMonthYearString(startSpan);
                const endMY = getMonthYearString(endSpan);

                // If year crosses over, show both years, else combine cleanly
                if (startMY.year === endMY.year) {
                    monthStr = `${startMY.monthName}/${endMY.monthName}-${endMY.year}`;
                } else {
                    monthStr = `${startMY.monthName}-${startMY.year}/${endMY.monthName}-${endMY.year}`;
                }
            }
        }

        const amountExclVat = (percent / 100) * basePrice;
        const vatAmount = amountExclVat * VAT_RATE;
        const amountInclVat = amountExclVat + vatAmount;

        schedule.push({
            count: i,
            year: getMonthYearString(endSpan).year, // Retained for tracking
            month: monthStr, // Formats dynamically depending on multi-month or single month
            displayMonth: displayMonthStr, // Shows ranges like "3rd / 4th Month"
            percent: `${percent.toFixed(2)}%`,
            amountInclVat,
            amountExclVat,
            remark
        });

        runningTotalPercent = parseFloat((runningTotalPercent + percent).toFixed(2));
    }

    return {
        schedule,
        basePrice,
        discountApplied,
        totalDiscountAmount,
        priceAfterDiscount,
        downpaymentBeforeDiscount,
        downpaymentAfterDiscount,
        startDate: formattedStartDate,
        endDate: expectedEndDate,
        others,
        userInput,
        Documetation,
        isoCertification,
        Erp
    };
};

export const generateContractData = (formdata) => {
    const total = Number(formdata?.[0]?.totalEmp_learners || 0) + Number(formdata?.[0]?.totalEducator || 0);
    const baseprice = total * 37.67 * 36;
    // console.log(baseprice)

    let selectedPricing;
    if (total > 0 && total < 500) {
        selectedPricing = pricingData.find(item => item.headCount === 500);
    } else {
        selectedPricing = pricingData.find(item => item.headCount >= total) || pricingData[pricingData.length - 1];
    }

    let totalInstallment = 0, DownPaymentPer = 0, Documetation = 0, isoCertification = 0, Erp = 0;

    if (total >= 0 && total <= 500) {
        totalInstallment = 9; DownPaymentPer = 40; Documetation = 40; isoCertification = 45; Erp = 15;
    } else if (total > 500 && total <= 800) {
        totalInstallment = 11; DownPaymentPer = 40; Documetation = 45; isoCertification = 40; Erp = 15;
    } else if (total > 800 && total <= 1200) {
        totalInstallment = 14; DownPaymentPer = 30; Documetation = 45; isoCertification = 40; Erp = 15;
    } else if (total > 1200 && total <= 1600) {
        totalInstallment = 18; DownPaymentPer = 25; Documetation = 40; isoCertification = 45; Erp = 15;
    } else {
        totalInstallment = 22; DownPaymentPer = 20; Documetation = 40; isoCertification = 45; Erp = 15;
    }

    return calculateSchedule(
        totalInstallment, DownPaymentPer, baseprice, formdata?.date, selectedPricing, formdata, Documetation, isoCertification, Erp
    );
};

export const useContractCalculator = (mainID) => {
    const { getOnlyOrgDetails_ } = useGet();
    const { data=null, mutate, isLoading=false } = getOnlyOrgDetails_ ?? {};

    const [final, setFinal] = useState(null);
    const [printData, setPrintData] = useState(null);

    useEffect(() => {
        if (mainID && typeof mutate === 'function') {
            mutate({ parms: { _id: mainID } });
        }
    }, [mainID, mutate]);
    // console.log(printData)
    
    useEffect(() => {
        const organizationDetails = data?.data?.organizationDetails;
        if (organizationDetails) {
            setPrintData(organizationDetails);
            const generatedResult = generateContractData(organizationDetails);
            setFinal(generatedResult);
        }
    }, [data]);

    return { final, printData, isLoading, status: data?.status };
};