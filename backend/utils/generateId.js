/**
 * HEM∆ — ID Generator Utilities
 * Generates unique IDs with prefix, year, and random suffix.
 */

function randomSuffix() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function generateDonorId() {
    return `DNR-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateHospitalId() {
    return `HSP-${new Date().getFullYear()}-KL-${randomSuffix()}`;
}

function generateBankId() {
    return `BNK-${new Date().getFullYear()}-KL-${randomSuffix()}`;
}

function generatePatientId() {
    return `PAT-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateRequestId() {
    return `REQ-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateIssueId() {
    return `ISS-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generatePaymentId() {
    return `PAY-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateDonationId() {
    return `DON-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateHealthCheckId() {
    return `HC-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateStockId() {
    return `STK-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateUserId() {
    return `USR-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateLogId() {
    return `LOG-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateAppointmentId() {
    return `APT-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateCampId() {
    return `CMP-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateRSVPId() {
    return `RSV-${new Date().getFullYear()}-${randomSuffix()}`;
}

function generateNotificationId() {
    return `NTF-${new Date().getFullYear()}-${randomSuffix()}`;
}

module.exports = {
    generateDonorId,
    generateHospitalId,
    generateBankId,
    generatePatientId,
    generateRequestId,
    generateIssueId,
    generatePaymentId,
    generateDonationId,
    generateHealthCheckId,
    generateStockId,
    generateUserId,
    generateLogId,
    generateAppointmentId,
    generateCampId,
    generateRSVPId,
    generateNotificationId
};
