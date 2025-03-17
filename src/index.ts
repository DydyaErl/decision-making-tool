import { App } from './components/App';
import './styles/main.css';


function initApp(): void {

  const app = new App();


  const appElement = app.render();
  document.body.appendChild(appElement);
}


document.addEventListener('DOMContentLoaded', initApp);