import React from 'react'
import { Button, Modal, Loader, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import AvatarEditor from '../avatarEditor/creatAvatar'
import Pofile from './profile'
import axios from 'axios'
import config from '../env'
import { bindActionCreators } from 'redux'
import * as UserActions from '../store/actions/user'
import * as VarsActions from '../store/actions/vars'
import SignUpForm from './signUpForm'
import { toTitleCase } from '../util'
import LoginForm from './lognForm'
import * as BlogsActions from '../store/actions/blogs'
import * as BlogActions from '../store/actions/blog'
import PropTypes from 'prop-types'

const env = config[process.env.NODE_ENV] || 'development'

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            logingin: false,
            validatingKnounUser: true,
            registering: false,
            password: null,
            confirmPass: null,
            userName: null,
            firstName: null,
            lastName: null,
            email: null,
            avatar: null,
            warning: true,
            success: false,
            hideMessage: true,
            creatAvatarOpen: false,
            imagePreviewUrl: '',
            file: '',
            error: false,
            errorDetails: null,
            signUp: false,
            userBlogs: null
        }
    };

    validateUser = () => {
        this.setState({ hideMessage: true })
        let known = localStorage.getItem('user')
        if (known) {
            let user = JSON.parse(localStorage.getItem('user'))
            return axios.post(env.httpURL, {
                'queryMethod': 'validateUser',
                'queryData': {
                    '_id': user._id,
                    'id': user.id,
                    'userName': user.userName
                }
            })
                .then((success) => {
                    if (success.data.state) {
                        if (success.data.state === true) {
                            this.props.varsActions.updateVars({ currentLocation: 'profile' })
                            this.setBlogs(user.userName)
                            this.props.userActions.updateUser(user)
                            this.props.history.push('/user/' + user.userName)
                            this.setState({ validatingKnounUser: false })
                            return true
                        } else {
                            this.props.userActions.updateUser(null)
                            localStorage.removeItem('user')
                            this.setState({ validatingKnounUser: false })
                            return false
                        }
                    } else {
                        this.props.userActions.updateUser(null)
                        localStorage.removeItem('user')
                        this.setState({ validatingKnounUser: false })
                        return false
                    }
                })
                .catch((err) => {
                    console.log(err)
                    localStorage.removeItem('user')
                    this.setState({ validatingKnounUser: false })
                    return err
                })
        } else {
            if (window.location.pathname === '/signup') {
                this.props.history.push('/signup')
            } else if (window.location.pathname !== '/login') {
                this.props.history.push('/login')
            }
            this.setState({ validatingKnounUser: false })
        }
    }

    onLoginClick = () => {
        this.setState({ logingin: true })
        if (!this.state.userName || !this.state.password) {
            this.setState({
                error: true,
                hideMessage: false,
                logingin: false,
                errorDetails: { field: 'Login', message: 'Invalid login details' }
            })
            setTimeout(function () {
                this.setState({ error: false, hideMessage: true })
            }.bind(this), 2000)
            return false
        }
        let userData = {
            userName: this.state.userName,
            password: this.state.password
        }
        axios.post(`${env.httpURL}/login`, userData)
            .then((success) => {
                if (!success.data) {
                    this.setState({ logingin: false })
                    this.errorStateHandler(false, true, false, false, 'Login', 'An error occurred, Check your Internet')
                    this.setTimer('hideMessage')
                    return
                }
                if (success.data.id) {
                    let user = success.data
                    this.setBlogs(user.userName)
                    success.data.name = success.data.userName
                    this.setState({ logingin: false })
                    this.props.userActions.updateUser(user)
                    localStorage.setItem('user', JSON.stringify(success.data))
                    this.props.history.push('/user/' + success.data.userName)
                    return
                } else {
                    this.setState({ logingin: false })
                    this.errorStateHandler(false, true, false, false, 'Login', success.data.error)
                    this.setTimer('hideMessage')
                    return
                }
            })
            .catch((error) => {
                this.setState({ logingin: false })
                this.errorStateHandler(false, true, false, false, 'Failed', error.response.data.error || 'An erro occured, Check your Internet')
                this.setTimer('hideMessage')
            })
    }

    setTimer = (stateItem) => {
        setTimeout(() => {
            this.setState({ [stateItem]: true, error: false })
        }, 2000)
    }

    errorStateHandler = (success, error, hideMessage, registering, field, message) => {
        this.setState({
            success: success,
            error: error,
            hideMessage: hideMessage,
            registering: registering,
            errorDetails: { field: field, message: message }
        })
    }

    handleSignUp = () => {
        this.setState({ registering: true })
        if (!this.state.userName || this.state.userName.length < 4) {
            this.errorStateHandler(false, true, false, false, 'Username', 'Username is required and must be more tha 5 characters')
            this.setTimer('hideMessage')
            return
        }
        if (!this.state.firstName || this.state.firstName.length < 3) {
            this.errorStateHandler(false, true, false, false, 'First Name', 'First Name is required and must be more tha 3 characters')
            this.setTimer('hideMessage')
            return
        }
        if (!this.state.lastName || this.state.lastName.length < 3) {
            this.errorStateHandler(false, true, false, false, 'Last Name', 'Last Name is required and must be more tha 5 characters')
            this.setTimer('hideMessage')
            return
        }
        if (!this.state.email) {
            this.errorStateHandler(false, true, false, false, 'Email', 'Email Address is required')
            this.setTimer('hideMessage')
            return
        }
        if (typeof this.state.imagePreviewUrl !== 'object') {
            this.errorStateHandler(false, true, false, false, 'Avatar', 'You have not created profile picture')
            this.setTimer('hideMessage')
            return
        }
        if (!this.state.password || !this.state.confirmPass) {
            this.errorStateHandler(false, true, false, false, 'Password', 'Password is required')
            this.setTimer('hideMessage')
            return
        }
        if (this.state.password !== this.state.confirmPass) {
            this.errorStateHandler(false, true, false, false, 'Password', 'Passwords dont match')
            this.setTimer('hideMessage')
            return
        }
        let userData = {
            firstName: toTitleCase(this.state.firstName.toLowerCase()),
            lastName: toTitleCase(this.state.lastName.toLowerCase()),
            userName: this.state.userName.toLowerCase(),
            email: this.state.email.toLowerCase(),
            password: this.state.password,
            avatar: JSON.stringify(this.state.imagePreviewUrl)
        }
        axios.post(`${env.httpURL}/signup`, userData)
            .then((success) => {
                if (!success.data) {
                    this.errorStateHandler(false, true, false, false, 'Failed', 'An error occured. Check your Internet')
                    this.setTimer('hideMessage')
                    return
                }
                if (success.data.code === 200) {
                    setTimeout(() => this.props.history.push('/login'), 2100)
                    this.errorStateHandler(true, true, false, false, 'Success', 'Success, account created')
                    this.setTimer('hideMessage')
                    return
                } else {
                    this.errorStateHandler(false, true, false, false, 'Failed', success.data.error)
                    this.setTimer('hideMessage')
                    return
                }
            })
            .catch((error) => {
                let mess = error.response.data.error || error.message
                this.errorStateHandler(false, true, false, false, 'Failed', mess)
                this.setTimer('hideMessage')
                return
            })
    }

    handleFormField = (e) => {
        e.preventDefault()
        this.setState({ [e.target.name]: e.target.value })
    }

    setAvatar = (img) => {
        this.setState({ imagePreviewUrl: img })
    }

    showCreateAvatar = (state) => {
        this.setState({ creatAvatarOpen: state })
    };
    closeCreateAvatar = () => {
        this.setState({ creatAvatarOpen: false })
    };

    async componentDidMount() {
        this.props.varsActions.updateVars({ blogLoaded: true, currentLocation: 'login' })
        this.props.blogActions.resetBlog()
        await this.validateUser()
    }

    componentWillReceiveProps() {
        let page = window.location.pathname.split('/')[1]
        if (page === 'signup' && !this.props.vars.signUp) {
            this.props.varsActions.updateVars({ signUp: true })
        }
        if (page === 'login' && this.props.vars.signUp) {
            this.props.varsActions.updateVars({ signUp: false })
        }
    }

    setBlogs = (userName) => {
        axios.post(env.httpURL, {
            'queryMethod': 'getPosts',
            'queryData': {
                'author.userName': userName
            }
        })
            .then(function (response) {
                if (response.data[0]) {
                    this.props.blogsActions.updateBlogs(response.data)
                } else {
                    this.props.blogsActions.updateBlogs([])
                }
            }.bind(this))
            .catch(function (err) {
                this.props.blogsActions.updateBlogs([])
            }.bind(this))
    }

    handSwichReg = (state) => {
        this.props.varsActions.updateVars({ signUp: state })
    }

    _handleFileChange = (e) => {
        e.preventDefault()
        if (window.FileReader) {
            let reader = new FileReader()
            let file = e.target.files[0]

            reader.onloadend = () => {
                this.setState({
                    file: file,
                    imagePreviewUrl: reader.result
                })
            }
            reader.readAsDataURL(file)
        } else {
            alert('FileReader are not supported in this browser.')
        }
    }

    loadHandler = (event) => {
        this.setState({ avatar: event.target.result })
    }

    render() {
        return (
            <div className='main_body'>
                {
                    this.state.validatingKnounUser
                        ? <div style={{ left: '50%', position: 'fixed', bottom: '50%', zIndex: -1 }}>
                            <Loader active inline='centered' />
                        </div>
                        : <div>
                            {
                                this.props.user && this.props.user.id
                                    ? <div>
                                        <Pofile
                                            history={this.props.history}
                                            userBlogs={this.state.userBlogs}
                                            createNew={this.props.vars.createNew}
                                            colors={this.props.vars.colors}
                                        />
                                    </div>
                                    : <div>
                                        <Modal open={this.state.creatAvatarOpen}>
                                            <Modal.Header><Header
                                                style={{ margin: '1em 0em 0em 0em', textAlign: 'left', alignment: 'center' }}
                                                color='green' as='h1'>
                                                Create your Profile Picture.
                                            </Header></Modal.Header>
                                            <Modal.Content>
                                                <div>
                                                    <p>
                                                        Click preview to see your picture as it will appear.
                                                    </p>
                                                </div>
                                                <hr />
                                                <Modal.Description>
                                                    <AvatarEditor setAvatar={this.setAvatar} />
                                                </Modal.Description>
                                            </Modal.Content>
                                            <Modal.Actions>
                                                <Button.Group>
                                                    <Button color='blue' onClick={this.closeCreateAvatar}>Cancel</Button>
                                                    <Button.Or />
                                                    <Button color='green' onClick={this.closeCreateAvatar}>Save</Button>
                                                </Button.Group>
                                            </Modal.Actions>
                                        </Modal>
                                        <div className='forms-ls'>
                                            {
                                                this.props.vars.signUp
                                                    ? <div className='signup-form'>
                                                        <SignUpForm
                                                            handleFormField={this.handleFormField}
                                                            color={this.props.vars.colors[4]}
                                                            imagePreviewUrl={this.state.imagePreviewUrl}
                                                            handSwichReg={this.handSwichReg}
                                                            showCreateAvatar={this.showCreateAvatar}
                                                            handleSignUp={this.handleSignUp}
                                                            errorDetails={this.state.errorDetails}
                                                            registering={this.state.registering}
                                                            error={this.state.error}
                                                            success={this.state.success}
                                                            hideMessage={this.state.hideMessage}
                                                        />
                                                    </div>
                                                    : <div className='login-form'>
                                                        <LoginForm
                                                            color={this.props.vars.colors[0]}
                                                            logingin={this.state.logingin}
                                                            handSwichReg={this.handSwichReg}
                                                            handleFormField={this.handleFormField}
                                                            onLoginClick={this.onLoginClick}
                                                            errorDetails={this.state.errorDetails}
                                                            error={this.state.error}
                                                            success={this.state.success}
                                                            hideMessage={this.state.hideMessage}
                                                        />
                                                    </div>
                                            }
                                        </div>
                                    </div>
                            }
                        </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        vars: state.vars
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        blogActions: bindActionCreators(BlogActions, dispatch),
        blogsActions: bindActionCreators(BlogsActions, dispatch),
        userActions: bindActionCreators(UserActions, dispatch),
        varsActions: bindActionCreators(VarsActions, dispatch)
    }
}

Login.propTypes = {
    user: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null])
    ]),
    vars: PropTypes.object.isRequired,
    blogsActions: PropTypes.object.isRequired,
    userActions: PropTypes.object.isRequired,
    blogActions: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    varsActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
