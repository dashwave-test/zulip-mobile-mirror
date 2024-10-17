import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  navWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // Adjusted height to occupy less space
    height: 44,
    padding: 8,
    backgroundColor: '#f8f9fa',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  halfPaddingRight: {
    paddingRight: 4,
  },
  rightItem: {
    textAlign: 'right',
  },
  flexed: {
    flex: 1,
  },
});

export default styles;
