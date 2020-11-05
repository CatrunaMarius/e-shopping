import React from 'react';
import {Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import './App.css';


import HomePage from './pages/homepage/homepage.component';
import ShopPage from './pages/shop/shop.component';
import Header from './componets/header/header.component'
import SignInAndSignUpPage  from './pages/sign-in-and-sign-up/sign-in-and-sign-up.component'
import CheckoutPage from './pages/chechout/chechout.component'

import { auth, createUserProfileDocument, addCollectionAndDocuments } from './firebase/firebase.utils'
import { setCurrentUser } from './redux/user/user.actions';
import {selectCurrentUser} from './redux/user/user.selectors'
import { selectCollectionsForPreview } from './redux/shop/shop.selectors';

class App extends React.Component {



  unsubscribeFromAuth = null;

  componentDidMount(){

    // destructurare colectione
    const {setCurrentUser, collectionsArray } = this.props;

    this.unsubscribeFromAuth = auth.onAuthStateChanged(async userAuth => {
            
       if (userAuth){
         const userRef = await createUserProfileDocument(userAuth);

         userRef.onSnapshot(snapShot => {
            setCurrentUser({            
              id: snapShot.id,
              ...snapShot.data()
                     
           });        
         });
       }

       setCurrentUser(userAuth);
      //  adauga lista din shop.data.js catre firbase
       addCollectionAndDocuments('collections', collectionsArray.map(({title, items }) =>({title, items })));
    });
  }




  componentWillUnmount(){
    this.unsubscribeFromAuth();
  }

  render(){
    return (
      <div >
        <Header /> 
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route  path='/shop' component={ShopPage} />
          <Route exact path='/checkout' component={CheckoutPage} />
          <Route exact path='/signin' render={() => this.props.currentUser ? (<Redirect to='/' />) : (<SignInAndSignUpPage />)} />
        </Switch>
        
  
      </div>
    );
  }
  
}

// atunci cand este conecta userul nu mai ai a acces la pagina de signin
// redirectioneaza catre home daca utilizatorul este signin
const mapStateToProps = createStructuredSelector({
   currentUser: selectCurrentUser,
  //  adauga shop.data catre firebase
   collectionsArray: selectCollectionsForPreview
})


// trimite setcurentUser
const mapDispatchToProps = dispatch => ({
  setCurrentUser: user => dispatch(setCurrentUser(user))
})

export default connect(mapStateToProps, mapDispatchToProps )(App) ;
