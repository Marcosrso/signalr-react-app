import React, { useEffect, useState } from 'react';
import * as signalR from '@aspnet/signalr';
import logo from './logo.svg';
import './App.css';

const App: React.FC = () => {
  const [notification, setNotification] = useState<string>();

  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:3001`, {
        accessTokenFactory: () => 'access_key',
      })
      .configureLogging(signalR.LogLevel.Information) // Check the levels logs that meet your needs.
      .build();

    hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
      })
      .catch(error =>
        console.log('HUB error log when starting connection: ', error),
      );

    hubConnection.onclose(error => {
      /* If there is an error in the connection between the HUB and the client, try to reconnect automatically, 
      otherwise the connection was closed when the component 
      was unmounted and it will not be necessary to try to reconnect it */
      if (error) {
        setTimeout(() => {
          console.log('Try to re start connection...');
          hubConnection
            .start()
            .then(() => {
              console.log('Connection re started');
            })
            .catch(err =>
              console.log('HUB error log to restart connection: ', err),
            );
        }, 3000);
      } else {
        console.log(
          'The client has closed the signalR connection, so no attempt to reconnect will be made',
        );
      }
    });

    hubConnection.on('MethodName', notificationData => {
      console.log('Notification received from HUB', notificationData);
      setNotification(notificationData);
    });

    // Close connection to HUB when component to unmounted
    return () => {
      hubConnection
        .stop()
        .then(() => {
          console.log('Connection closed');
        })
        .catch(error =>
          console.log('HUB error log on close connection: ', error),
        );
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello world!</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {notification && <p>{notification}</p>}
      </header>
    </div>
  );
};

export default App;
