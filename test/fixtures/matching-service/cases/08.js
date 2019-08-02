module.exports = {
  description: 'trainline real case',
  bills: [
    {
      _id: 'b1',
      amount: 297,
      date: '2017-05-04T00:00:00.000Z',
      isRefund: false,
      vendor: 'Trainline',
      type: 'transport'
    }
  ],
  operations: [
    {
      _id: 'trainline',
      date: '2017-05-05T12:00:00.000Z',
      label: 'TRAINLINE PARIS',
      amount: -297,
      manualCategoryId: '400840'
    }
  ],
  expectedResult: {
    b1: {
      debitOperation: 'trainline'
    }
  }
}
