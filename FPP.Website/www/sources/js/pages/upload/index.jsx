import React from 'react';
import ReactDOM from 'react-dom';

import AppContainer from './components/AppContainer';
import '../../../css/pages/dashboard/index.scss';

const appContainer = document.getElementById('app-container');
const isHost = appContainer.getAttribute('data-param') === 'True';

ReactDOM.render(<AppContainer isHost={isHost} />, document.getElementById('app-container'));
