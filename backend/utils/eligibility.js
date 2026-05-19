const daysBetween = (d1, d2) => {
    const t1 = new Date(d1).getTime();
    const t2 = new Date(d2).getTime();
    return Math.floor(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));
};

const calcEligibility = (hb, wt, lastDate) => {
    const coolingDays = parseInt(process.env.COOLING_PERIOD_DAYS) || 90;
    const minHb = parseFloat(process.env.MIN_HEMOGLOBIN) || 12.5;
    const minWt = parseFloat(process.env.MIN_WEIGHT_KG) || 45;

    if (hb < minHb || wt < minWt) return 'Deferred';
    if (lastDate) { 
        const d = daysBetween(lastDate, new Date()); 
        if (d < coolingDays) return 'Cooling'; 
    }
    return 'Eligible';
};

module.exports = { calcEligibility, daysBetween };
