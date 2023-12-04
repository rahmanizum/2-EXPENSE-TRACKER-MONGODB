const Expenses = require('../models/expenses');
exports.addExpenses = async (request, response, next) => {
    let transaction;
    try {
        const {userId} = request;
        const { category, pmethod, amount, date } = request.body;
        const expense = new Expenses(userId,category,pmethod,amount,date)
        await expense.save();
        response.status(200).json({ message: 'Data successfully added' });

    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'An error occurred' });
    }
}

exports.getExpenses = async (request, response, nex) => {
    try {
        const {userId} = request;
        const page = request.query.page;
        const limit = Number(request.query.noitem);
        const offset = (page - 1) * 5;
        const expenses = await Expenses.fetchAll(offset,limit,userId)
        response.status(200).json({
            expenses: expenses,
            totalexpenses: 0,
            hasMoreExpenses : expenses.length === limit,
            hasPreviousExpenses : page > 1
        });

    } catch (error) {
        console.log(error);
        return response.status(401).json({ message: 'Unauthorized relogin required' });
    }
}
exports.deletebyId = async (request, response, next) => {
    let transaction;
    try {
        const dID = request.params.dID;
        const {userId} = request;
        const {deletedCount} = await Expenses.deleteById(dID,userId);
        if (deletedCount==0) {
            return response.status(401).json({ message: 'You are not Authorized' });
        } else {
            response.status(200).json({ message: 'Succeffully deleted' });
        }
    } catch (error) {
        console.log(error);
    }
}
exports.getExpensesbyid = async (request, response, nex) => {
    try {
        const eID = request.params.eID;
        const {userId} = request;
        const expense = await Expenses.fetchById(eID,userId)
        response.status(200).json(expense);

    } catch (error) {
        console.log(error);
        return response.status(401).json({ message: 'Unauthorized relogin required' });
    }
}
exports.updateExpensebyid = async (request, response, next) => {
    try {
        const uID = request.params.uID;
        const {userId} = request;
        const { category, pmethod, amount, date } = request.body;
        const expense = new Expenses(userId,category,pmethod,amount,date,uID)
        await expense.save();
        response.status(200).json({ message: 'Data succesfully updated' });
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.log(error);
    }
}
