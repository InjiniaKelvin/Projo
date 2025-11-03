
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingStep {
 id: number;
 title: string;
 description: string;
 component: React.ComponentType<any>;
 isCompleted: boolean;
 isActive: boolean;
 isLocked: boolean;
}

/**
 * QuickFix Step-by-Step Booking Flow Component
 * 
 * Implements the official QuickFix booking process:
 * 1. Service Selection
 * 2. Location Details 
 * 3. Time & Urgency
 * 4. Contact Information
 * 5. Review & Confirm
 */
export const QuickFixBookingFlow: React.FC = () => {
 const [currentStep, setCurrentStep] = useState(1);
 const [completedSteps, setCompletedSteps] = useState<number[]>([]);
 
 const steps: BookingStep[] = [
 {
 id: 1,
 title: 'Service Selection',
 description: 'Choose the service you need',
 component: ServiceSelectionStep,
 isCompleted: completedSteps.includes(1),
 isActive: currentStep === 1,
 isLocked: false
 },
 {
 id: 2,
 title: 'Location Details',
 description: 'Provide accurate Nairobi location',
 component: LocationDetailsStep,
 isCompleted: completedSteps.includes(2),
 isActive: currentStep === 2,
 isLocked: !completedSteps.includes(1)
 },
 {
 id: 3,
 title: 'Time & Urgency',
 description: 'When do you need the service?',
 component: TimeUrgencyStep,
 isCompleted: completedSteps.includes(3),
 isActive: currentStep === 3,
 isLocked: !completedSteps.includes(2)
 },
 {
 id: 4,
 title: 'Contact Information',
 description: 'Your contact details',
 component: ContactInformationStep,
 isCompleted: completedSteps.includes(4),
 isActive: currentStep === 4,
 isLocked: !completedSteps.includes(3)
 },
 {
 id: 5,
 title: 'Review & Confirm',
 description: 'Review and submit your booking',
 component: ReviewConfirmStep,
 isCompleted: completedSteps.includes(5),
 isActive: currentStep === 5,
 isLocked: !completedSteps.includes(4)
 }
 ];

 const completeStep = (stepId: number) => {
 if (!completedSteps.includes(stepId)) {
 setCompletedSteps(prev => [...prev, stepId]);
 }
 
 // Move to next step if available
 if (stepId < steps.length) {
 setCurrentStep(stepId + 1);
 }
 };

 const goToStep = (stepId: number) => {
 const step = steps.find(s => s.id === stepId);
 if (step && !step.isLocked) {
 setCurrentStep(stepId);
 }
 };

 return (
 <View style={styles.container}>
 {/* Progress Header */}
 <View style={styles.progressContainer}>
 <Text style={styles.progressTitle}>QuickFix Booking Process</Text>
 <View style={styles.stepsContainer}>
 {steps.map((step, index) => (
 <TouchableOpacity
 key={step.id}
 style={[
 styles.stepIndicator,
 step.isCompleted && styles.stepCompleted,
 step.isActive && styles.stepActive,
 step.isLocked && styles.stepLocked
 ]}
 onPress={() => goToStep(step.id)}
 disabled={step.isLocked}
 >
 <Text style={[
 styles.stepNumber,
 step.isCompleted && styles.stepNumberCompleted,
 step.isActive && styles.stepNumberActive
 ]}>
 {step.isCompleted ? '' : step.id}
 </Text>
 {index < steps.length - 1 && (
 <View style={[
 styles.stepConnector,
 step.isCompleted && styles.stepConnectorCompleted
 ]} />
 )}
 </TouchableOpacity>
 ))}
 </View>
 
 <Text style={styles.currentStepTitle}>
 Step {currentStep}: {steps[currentStep - 1]?.title}
 </Text>
 <Text style={styles.currentStepDescription}>
 {steps[currentStep - 1]?.description}
 </Text>
 </View>

 {/* Current Step Content */}
 <ScrollView style={styles.contentContainer}>
 {React.createElement(steps[currentStep - 1]?.component, {
 onComplete: () => completeStep(currentStep),
 onNext: () => setCurrentStep(prev => Math.min(prev + 1, steps.length)),
 onPrevious: () => setCurrentStep(prev => Math.max(prev - 1, 1))
 })}
 </ScrollView>
 </View>
 );
};

// Step Components (placeholders - integrate with existing components)
const ServiceSelectionStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
 <View style={styles.stepContent}>
 <Text style={styles.stepTitle}>Select Your Service</Text>
 {/* Integrate with existing service-selection.tsx */}
 <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
 <Text style={styles.continueButtonText}>Continue to Location</Text>
 </TouchableOpacity>
 </View>
);

const LocationDetailsStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
 <View style={styles.stepContent}>
 <Text style={styles.stepTitle}>Location Details</Text>
 {/* Integrate with enhanced Nairobi location picker */}
 <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
 <Text style={styles.continueButtonText}>Continue to Time</Text>
 </TouchableOpacity>
 </View>
);

const TimeUrgencyStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
 <View style={styles.stepContent}>
 <Text style={styles.stepTitle}>Time & Urgency</Text>
 <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
 <Text style={styles.continueButtonText}>Continue to Contact</Text>
 </TouchableOpacity>
 </View>
);

const ContactInformationStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
 <View style={styles.stepContent}>
 <Text style={styles.stepTitle}>Contact Information</Text>
 <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
 <Text style={styles.continueButtonText}>Review Booking</Text>
 </TouchableOpacity>
 </View>
);

const ReviewConfirmStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
 <View style={styles.stepContent}>
 <Text style={styles.stepTitle}>Review & Confirm</Text>
 <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
 <Text style={styles.continueButtonText}>Submit Booking</Text>
 </TouchableOpacity>
 </View>
);

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#fff',
 },
 progressContainer: {
 backgroundColor: '#f8f9fa',
 padding: 20,
 paddingTop: 40,
 borderBottomWidth: 1,
 borderBottomColor: '#e9ecef',
 },
 progressTitle: {
 fontSize: 18,
 fontWeight: 'bold',
 textAlign: 'center',
 marginBottom: 20,
 color: '#2c3e50',
 },
 stepsContainer: {
 flexDirection: 'row',
 justifyContent: 'center',
 alignItems: 'center',
 marginBottom: 20,
 },
 stepIndicator: {
 position: 'relative',
 alignItems: 'center',
 },
 stepNumber: {
 width: 40,
 height: 40,
 borderRadius: 20,
 backgroundColor: '#e9ecef',
 color: '#6c757d',
 textAlign: 'center',
 lineHeight: 40,
 fontSize: 16,
 fontWeight: 'bold',
 },
 stepNumberActive: {
 backgroundColor: '#007bff',
 color: '#fff',
 },
 stepNumberCompleted: {
 backgroundColor: '#28a745',
 color: '#fff',
 },
 stepConnector: {
 position: 'absolute',
 left: 40,
 top: 20,
 width: 40,
 height: 2,
 backgroundColor: '#e9ecef',
 },
 stepConnectorCompleted: {
 backgroundColor: '#28a745',
 },
 stepLocked: {
 opacity: 0.5,
 },
 currentStepTitle: {
 fontSize: 16,
 fontWeight: 'bold',
 textAlign: 'center',
 color: '#2c3e50',
 },
 currentStepDescription: {
 fontSize: 14,
 textAlign: 'center',
 color: '#6c757d',
 marginTop: 5,
 },
 contentContainer: {
 flex: 1,
 },
 stepContent: {
 padding: 20,
 minHeight: 400,
 },
 stepTitle: {
 fontSize: 20,
 fontWeight: 'bold',
 marginBottom: 20,
 color: '#2c3e50',
 },
 continueButton: {
 backgroundColor: '#007bff',
 padding: 15,
 borderRadius: 8,
 marginTop: 20,
 },
 continueButtonText: {
 color: '#fff',
 textAlign: 'center',
 fontSize: 16,
 fontWeight: 'bold',
 },
});

export default QuickFixBookingFlow;
