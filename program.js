const fs = require('fs');
const path = require('path');

function generateBalanceSheet(data) {
  const balanceSheet = {};

  // Process expense data
  for (const expense of data.expenseData || []) {
    const startDate = new Date(expense.startDate);
    const monthKey = startDate.toISOString().slice(0, 7); // Generate month-based key
    const amount = expense.amount || 0;

    if (balanceSheet[monthKey]) {
      balanceSheet[monthKey] -= amount;
    } else {
      balanceSheet[monthKey] = -amount;
    }
  }

  // Process revenue data
  for (const revenue of data.revenueData || []) {
    const startDate = new Date(revenue.startDate);
    const monthKey = startDate.toISOString().slice(0, 7); // Generate month-based key
    const amount = revenue.amount || 0;

    if (balanceSheet[monthKey]) {
      balanceSheet[monthKey] += amount;
    } else {
      balanceSheet[monthKey] = amount;
    }
  }

  // Sort the balance sheet by timestamp (ascending order)
  const sortedBalanceSheet = Object.entries(balanceSheet).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Generate an array of months between the minimum and maximum timestamps
  const minTimestamp = sortedBalanceSheet[0]?.[0];
  const maxTimestamp = sortedBalanceSheet[sortedBalanceSheet.length - 1]?.[0];
  const monthsInRange = generateMonthRange(minTimestamp, maxTimestamp);

  // Prepare the output array
  const output = monthsInRange.map(month => ({
    amount: balanceSheet[month] || 0,
    startDate: month + '-01T00:00:00.000Z'
  }));

  return output;
}

// Function to generate an array of months between two timestamps
function generateMonthRange(startTimestamp, endTimestamp) {
  const startMonth = new Date(startTimestamp);
  const endMonth = new Date(endTimestamp);

  const months = [];
  let currentMonth = new Date(startMonth);

  while (currentMonth <= endMonth) {
    months.push(currentMonth.toISOString().slice(0, 7));
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return months;
}

// Read the JSON file
const filePath = path.resolve(__dirname, '2-input.json');

try {
  // Read the file contents
  const jsonData = fs.readFileSync(filePath, 'utf8');

  // Parse the JSON data
  const data = JSON.parse(jsonData);

  // Call the function with the imported data
  const balanceSheetOutput = generateBalanceSheet(data);

  // Display the balance sheet output
  console.log(JSON.stringify(balanceSheetOutput, null, 2));
} catch (error) {
  console.error('Error reading or parsing the JSON file:', error);
}
