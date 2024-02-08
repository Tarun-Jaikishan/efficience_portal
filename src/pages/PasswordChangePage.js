import React, { Component } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import { isString, isEmail, isNumeric, isTokenValid } from "../utilits";
import { Form, Button } from "react-bootstrap";
import { connect } from "react-redux";
import * as action from "../redux/action/index";
import SpinnerLoading from "../components/Spinner";
import { API_SETTING, USER_TOKEN, SITE_SETTING } from "../env.conf";
import { api } from "../axios";
import OtpVerificationModal from "../components/OtpVerificationModal";

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        email: {
          required: SITE_SETTING.settings.enable_email_verification,
          value: props.profile.email,
          validation: isEmail,
          errorMsg: null,
        },
        mobile_no: {
          required: true,
          value: props.profile.mobile_no,
          validation: isNumeric,
          errorMsg: null,
        },
        password: {
          required: true,
          value: "",
          validation: isString,
          errorMsg: null,
        },
        confirm_password: {
          required: true,
          value: "",
          validation: isString,
          errorMsg: null,
        },
      },
      formData: {},
      is_button_loading: false,
    };
  }

  async componentDidMount() {
    await this.props.fetchAccounts();
  }

  handleChange = (e) => {
    let form = { ...this.state.form };
    form[e.target.name].value = e.target.value;
    this.setState({
      form: { ...form },
    });
  };

  isFormValid = () => {
    let isvalid = true;
    const forms = { ...this.state.form };
    for (var field in forms) {
      if (forms[field].required && forms[field].value.length === 0) {
        forms[field].errorMsg = "Field required, Cannot be empty.";
        isvalid = isvalid && false;
      }
      if (
        typeof forms[field].validation === "function" &&
        forms[field].value !== null &&
        forms[field].value.length > 0
      ) {
        forms[field].errorMsg = !forms[field].validation(forms[field].value)
          ? " Invalid data."
          : "";
        isvalid = isvalid && forms[field].validation(forms[field].value);
      }
    }

    if (forms.password.value !== forms.confirm_password.value) {
      forms.password.errorMsg =
        "Password and confirm password value not matching.";
      isvalid = isvalid && false;
    }

    if (!isvalid) {
      this.setState({
        form: {
          ...forms,
        },
      });
    }
    return isvalid;
  };

  sendOtp = async (formData) => {
    const token = isTokenValid(USER_TOKEN);
    if (token) {
      const url = "subscriber/send-verification-otp";
      const headers = {
        Authorization: `Bearer ${token}`,
        authkey: API_SETTING.authkey,
      };
      const request = {
        subscriber_id: this.props.profile.id,
        email: formData.email,
        mobile_no: formData.mobile_no,
      };
      return await api
        .post(url, request, { headers })
        .then((resp) => {
          if (resp.data.success) {
            this.setState({
              modalshow: true,
            });
            return {
              status: resp.data.data.success,
              message: resp.data.data.message,
            };
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({
      is_button_loading: true,
    });
    if (this.isFormValid()) {
      const frm = { ...this.state.form };
      const formData = {};
      for (var field in frm) {
        formData[field] = frm[field].value;
      }
      this.setState({
        formData: formData,
      });
      this.sendOtp(formData);
    } else {
      this.setState({
        is_button_loading: false,
      });
    }
  };

  render(params) {
    let content = <SpinnerLoading />;
    if (this.props.profile) {
      content = (
        <div className="d-flex center-change-password">
          <Form onSubmit={this.handleSubmit} className="w-half">
            <div className="card">
              <div className="">
                <div className="">
                  <div className="px-5 py-3">
                    <div className="d-flex align-items-center justify-content-between font-weight-bold text-lg mt-2">
                      <Link
                        to="/profile"
                        type="button"
                        className="btn bg-purple text-white rounded-lg py-1 px-2 text-lg btn-sm"
                      >
                        <ArrowLeft className="h-fit" />
                      </Link>
                      <div>Change Password </div>
                      <div className="mr-2"></div>
                    </div>
                  </div>
                  <Container>
                    <Row xs={12} md={12} lg={12}>
                      <Col key="personal_details" xs={12} md={12} lg={12}>
                        <div className="px-5 py-2">
                          <div key="mobile_no">
                            <div key="mobile_no_label">
                              <Form.Group controlId="mobile_no_controId">
                                <Form.Label>Mobile No</Form.Label>
                                <div className="row">
                                  <div className="w-full mx-3">
                                    <Form.Control
                                      className="input-sm"
                                      type="text"
                                      name="mobile_no"
                                      placeholder="Enter mobile no"
                                      value={this.state.form.mobile_no.value}
                                      onChange={this.handleChange}
                                    />
                                    {this.state.form.mobile_no.errorMsg && (
                                      <p className="text-danger">
                                        {this.state.form.mobile_no.errorMsg}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Form.Group>
                            </div>
                          </div>
                          {SITE_SETTING.settings.enable_email_verification && (
                            <div key="email">
                              <div key="email_label">
                                <Form.Group controlId="email_controlId">
                                  <Form.Label>Email</Form.Label>
                                  <div className="row">
                                    <div className="w-full mx-3">
                                      <Form.Control
                                        className="input-sm"
                                        type="text"
                                        name="email"
                                        placeholder="Enter email no"
                                        value={this.state.form.email.value}
                                        onChange={this.handleChange}
                                      />
                                      {this.state.form.email.errorMsg && (
                                        <p className="text-danger">
                                          {this.state.form.email.errorMsg}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </Form.Group>
                              </div>
                            </div>
                          )}
                          <div key="password">
                            <div key="password_label">
                              <Form.Group controlId="password_controlId">
                                <Form.Label>Password</Form.Label>
                                <div className="row">
                                  <div className="w-full mx-3">
                                    <Form.Control
                                      className="input-sm"
                                      type="password"
                                      name="password"
                                      placeholder="Enter password"
                                      value={this.state.form.password.value}
                                      onChange={this.handleChange}
                                    />
                                    {this.state.form.password.errorMsg && (
                                      <p className="text-danger">
                                        {this.state.form.password.errorMsg}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Form.Group>
                            </div>
                          </div>
                          <div key="confirm_password">
                            <div key="confirm_password_label">
                              <Form.Group controlId="confirm_password_controlId">
                                <Form.Label>Confirm Password</Form.Label>
                                <div className="row">
                                  <div className="w-full mx-3">
                                    <Form.Control
                                      className="input-sm"
                                      type="password"
                                      name="confirm_password"
                                      placeholder="Enter confirm password"
                                      value={
                                        this.state.form.confirm_password.value
                                      }
                                      onChange={this.handleChange}
                                    />
                                    {this.state.form.confirm_password
                                      .errorMsg && (
                                      <p className="text-danger">
                                        {
                                          this.state.form.confirm_password
                                            .errorMsg
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Form.Group>
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col
                        xs={12}
                        md={12}
                        lg={12}
                        className="text-center btn-space"
                      >
                        <Button
                          type="submit"
                          className="text-center w-full btn-purple"
                          disabled={this.state.is_button_loading}
                        >
                          {this.state.is_button_loading
                            ? "Processing..."
                            : "Submit"}
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </div>
            </div>
            <OtpVerificationModal
              modalshow={this.state.modalshow}
              handleClose={() =>
                this.setState({ modalshow: false, is_button_loading: false })
              }
              subscriber_id={this.props.profile.id}
              email={this.state.form.email.value}
              mobile_no={this.state.form.mobile_no.value}
              formdata={this.state.formData}
              url="subscriber/update-password"
            />
          </Form>
        </div>
      );
    }
    return content;
  }
}

const mapStateToProps = (state) => {
  return {
    profile: state.customer.profile,
    accounts: state.customer.accounts,
    loading: state.customer.loading,
    error: state.customer.error,
    is_customer: state.auth.is_customer,
    is_mobile_verified: state.customer.profile.mobile_no_verified,
    is_email_verified: state.customer.profile.email_verified,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAccounts: () => dispatch(action.fetchAccounts()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
