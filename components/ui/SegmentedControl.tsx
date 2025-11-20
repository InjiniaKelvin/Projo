import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SegmentedControlProps {
  segments: string[];
  activeSegment: string;
  onSegmentChange: (segment: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ segments, activeSegment, onSegmentChange }) => {
  return (
    <View style={styles.container}>
      {segments.map((segment) => (
        <TouchableOpacity
          key={segment}
          style={[
            styles.segment,
            activeSegment === segment && styles.activeSegment,
          ]}
          onPress={() => onSegmentChange(segment)}
        >
          <Text
            style={[
              styles.segmentText,
              activeSegment === segment && styles.activeSegmentText,
            ]}
          >
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegment: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 2,
  },
  segmentText: {
    color: '#000000',
    fontWeight: '500',
  },
  activeSegmentText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
