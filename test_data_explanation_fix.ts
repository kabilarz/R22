/**
 * Quick test for data explanation functionality
 */

import fs from 'fs'
import path from 'path'

// Mock the clinical trial data structure
const sampleData = [
  {
    patient_id: 'P001',
    age: 45,
    gender: 'Male',
    treatment_group: 'Treatment_A',
    baseline_systolic_bp: 145,
    baseline_diastolic_bp: 92,
    week_12_systolic_bp: 132,
    week_12_diastolic_bp: 80,
    primary_outcome: 'Improved'
  }
]

// Test the query detection
function testQueryDetection() {
  const testQueries = [
    'explain the data',
    'can you explain the data',
    'describe the data',
    'what is this data',
    'tell me about this dataset',
    'data overview',
    'compare treatment groups', // Should NOT trigger explanation
    'show statistics' // Should NOT trigger explanation
  ]
  
  console.log('Testing query detection:')
  testQueries.forEach(query => {
    const isExploration = isDataExplorationQuery(query)
    console.log(`"${query}" -> ${isExploration ? 'EXPLANATION' : 'CODE/SUGGESTIONS'}`)
  })
}

function isDataExplorationQuery(query: string): boolean {
  const explorationKeywords = [
    'explain the data', 'describe the data', 'what is this data',
    'data overview', 'dataset summary', 'show me the data',
    'what do we have', 'data exploration', 'understand the data',
    'tell me about', 'overview of', 'summary of', 'explain data',
    'can you explain', 'what does this', 'describe this',
    'what kind of data', 'analyze the data', 'look at the data'
  ]
  
  const lowerQuery = query.toLowerCase().trim()
  return explorationKeywords.some(keyword => lowerQuery.includes(keyword))
}

// Run test
testQueryDetection()

console.log('\n✅ Query detection test completed')
console.log('\n💡 When you type "explain the data", you should now get:')
console.log('   📊 Dataset overview with medical context')
console.log('   🏥 Domain identification (Cardiology/Hypertension)')  
console.log('   📋 Column categorization')
console.log('   💡 Analysis suggestions')
console.log('   ❓ Follow-up question asking what you want to analyze')

export {}