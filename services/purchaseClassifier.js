function isCertificatePurchase(purchase) {
    if (purchase.kind) return purchase.kind === 'certificate';
    return purchase.price == null;
}

function isBookingPurchase(purchase) {
    if (purchase.kind) return purchase.kind === 'booking';
    return purchase.price != null;
}

function splitPurchases(purchases) {
    return {
        certificatePurchases: purchases.filter(isCertificatePurchase),
        bookingPurchases: purchases.filter(isBookingPurchase)
    };
}

module.exports = {
    isCertificatePurchase,
    isBookingPurchase,
    splitPurchases
};
