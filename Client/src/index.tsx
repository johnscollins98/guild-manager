import React from 'react';
import ReactDOM from 'react-dom';
import QueryProvider from './Components/QueryProvider';
require('dotenv').config();

ReactDOM.render(<QueryProvider />, document.getElementById('root'));
