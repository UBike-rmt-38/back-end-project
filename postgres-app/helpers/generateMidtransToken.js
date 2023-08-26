const midtransClient = require('midtrans-client');

module.exports = async (user, amount) => {
    const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_API_KEY
    });

    const parameter = {
        transaction_details: {
            order_id: "UBIKE" + Math.floor(1000000 + Math.random() * 9000000),
            gross_amount: amount
        },
        credit_card: {
            secure: true
        },
        customer_details: {
            username: user.username,
            email: user.email
        }
    };
    return await snap.createTransaction(parameter)
}