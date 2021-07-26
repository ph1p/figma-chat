import { Chat } from '@web/views/Chat';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 500px;
  max-height: 100%;
  max-width: 500px;
  background-color: ${(p) => p.theme.backgroundColor};
  @media (min-width: 450px) {
    border-radius: 8px;
    box-shadow: 0 0 100px #eee;
    display: grid;
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  @media (max-width: 450px) {
    height: 100%;
    width: 100%;
  }
`;

export const App = () => {
  return (
    <Wrapper>
      <Router>
        <Switch>
          <Route path="/">
            <Chat />
          </Route>
        </Switch>
      </Router>
    </Wrapper>
  );
};
