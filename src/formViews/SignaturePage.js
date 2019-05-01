import React, { Fragment } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import axios from 'axios';
import Spinner from '../Spinner';
import './SignaturePage.css';

const URL = 'https://wheredoivote.co.uk/api/beta/postcode/';

class SignaturePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emptySignature: false,
      electoralOffice: {
        name: '',
        address: '',
        postcode: '',
        phone: '',
        email: '',
        loaded: false,
        error: false,
      },
    };

    this.signForm = this.signForm.bind(this);
    this.lookupElectoralOffice = this.lookupElectoralOffice.bind(this);
  }

  componentDidMount() {
    this.lookupElectoralOffice();
  }

  async signForm() {
    const { updateData, switchView, submitData } = this.props;
    if (this.signaturePad.isEmpty()) {
      this.setState({ emptySignature: true });
    } else {
      await updateData({ target: { value: this.signaturePad.toDataURL(), name: 'signature' } });
      submitData();
      switchView('thankYou');
    }
  }

  async lookupElectoralOffice() {
    const { postcode } = this.props.formData;
    const { electoralOffice } = this.state;
    try {
      const response = await axios.get(URL + `${postcode}.json`)

      this.setState({
        electoralOffice: {
          name: response.data.council.name,
          email: response.data.council.email,
          phone: response.data.council.phone,
          address: response.data.council.address,
          postcode: response.data.council.postcode,
          loaded: true,
        },
      });
    } catch (e) {
      this.setState({
        electoralOffice: {
          ...electoralOffice,
          loaded: true,
          error: true,
        },
      });
    }
  }

  render() {
    const { signForm } = this;
    const { formData } = this.props;
    const { emptySignature, electoralOffice } = this.state;
    return (
      <Fragment>
        <h1>You are submitting:</h1>
        <ul className="RevisedUserDetails">
          {
            Object.keys(formData)
              .filter(key => formData[key].length)
              .map(key => (
                <li key={key}>
                  <b>
                    {key}
                    :&nbsp;
                  </b>
                  {formData[key]}
                </li>
              ))
          }
        </ul>
        <h2>Please sign:</h2>
        {emptySignature ? (
          <h3>You need to sign the form before you can proceed.</h3>
        ) : null}
        <div className="SignaturePad">
          <SignaturePad redrawOnResize ref={(ref) => { this.signaturePad = ref; }} />
        </div>
        <div className="ElectoralOffice">
          {electoralOffice.loaded ? (
            <h2>
              Your electoral office email is:
              {electoralOffice.error ? 'Error' : electoralOffice.email}
            </h2>
          ) : <Spinner />}
        </div>
        <button
          type="button"
          onClick={signForm}
        >
          Next
        </button>
      </Fragment>
    );
  }
}

export default SignaturePage;