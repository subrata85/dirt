/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

/**
 * Package modification
 */

// 1.'react-native-searchbar';
// need to remove this code from this package(SearchBar)
// ...Platform.select({
//     android: {
//         borderBottomColor: 'lightgray',
//         borderBottomWidth: StyleSheet.hairlineWidth
//     }
// })
