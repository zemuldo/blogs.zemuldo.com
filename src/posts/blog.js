import React from 'react'
import { Helmet } from 'react-helmet'
import { Button, Modal, Header, Icon, Image, Dropdown, Input, Form, Popup, Tab, Comment, Confirm, Visibility, Segment, Label, Select, Menu } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { topics, categories } from '../env'
import BlogEditor from '../blogEditor/editor'
import axios from 'axios'
import config from '../env'
import { bindActionCreators } from 'redux'
import * as BlogActions from '../store/actions/blog'
import * as UserActions from "../store/actions/user"
import PropTypes from 'prop-types'
import moment from 'moment'
import { peopleL, peopleU, inWords, toTitleCase, blogUrl, updateReplies, deleteComments, notifyMe } from '../util'
import {
    convertFromRaw,
    EditorState,
} from 'draft-js'
import {
    decorator
} from '../blogEditor/editorToolkit';
import { socialShares } from '../env'
import FacebookProvider, { Comments } from 'react-facebook'
import LoginForm from '../profile/lognForm'
import DisqusThread from '../chat/disqus';
import pick from 'lodash/pick'
import times from 'lodash/times'
import ZPopup from '../partials/popup'

const menuStyle = {
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    marginBottom: '1em',
    marginTop: '4em',
    transition: 'box-shadow 0.5s ease, padding 0.5s ease',
}

const fixedMenuStyle = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
}

const overlayStyle = {
    float: 'left',
}

const fixedOverlayStyle = {
    ...overlayStyle,
    position: 'fixed',
    top: '10%',
    zIndex: 10,
}

const overlayMenuStyle = {
    position: 'relative',
    transition: 'left 0.5s ease',
}

const fixedOverlayMenuStyle = {
    ...overlayMenuStyle,
    left: '1000px',
}

const env = config[process.env.NODE_ENV] || 'development'

class Blog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            youLike: false,
            showDelete: false,
            userLoggedIn: false,
            likes: this.props.blog ? this.props.blog.likes : 0,
            title: this.props.blog.title,
            wordCount: 0,
            blogUrl: blogUrl(this.props.blog),
            blogUrlT: blogUrl(this.props.blog),
            replyComment: '',
            comments: [],
            cdelopen: false,
            warning: true,
            error: false,
            success: false,
            hideMessage: true,
            logingin: false,
            menuFixed: false,
            overlayFixed: false,
        }
    }
    show = dimmer => () => this.setState({ dimmer, open: true });

    close = () => this.setState({ open: false })

    showDeleteComment = (_id) => this.setState({ cdelopen: true, commentToDelete: _id });

    handleConfirmDeleteComment = () => {
        this.deleteComments(this.state.commentToDelete);
        this.setState({ cdelopen: false })
    };

    handleCancelDeleteComment = () => this.setState({ cdelopen: false });

    handleFormFieldEdit = (e, data) => {
        this.props.blogActions.updateBlog({ [data.name]: data.value })
    }

    handleEditorStateEdit = () => {
        this.setState({ wordCount: this.props.blog.wordCount });
        let editorState = JSON.parse(this.props.blog.body);
        this.setState({ editorState: EditorState.createWithContent(convertFromRaw(editorState), decorator) })
    };

    closeDelete = () => {
        this.setState({ showDelete: false })
    }

    openDelete() {
        this.setState({ showDelete: true })
    }

    setBlogCounts = (shareUrl) => {
        this.getFBCount(shareUrl)
        this.getTWTCount(shareUrl)
        this.getGCCount(shareUrl)
    }

    getFBCount = (shareUrl) => {
        return axios.get('https://graph.facebook.com/?id=' + shareUrl, {})
            .then((res) => {
                this.props.blogActions.updateBlog({
                    fbC: this.props.blog.fbC + (res.data.share.share_count) ? res.data.share.share_count : 0
                })
                return true
            })
            .catch((err) => {
                this.props.blogActions.updateBlog({
                    fbC: this.props.blog.fbC
                })
            })
    };

    getAauthorAvatar() {
        axios.post(env.httpURL, {
            'queryMethod': 'getAvatar',
            'queryData': {
                'id': this.props.blog.authorID
            }
        })
            .then(function (res) {
                if (!res) {
                    return false
                }
                if (!res.data) {
                    return false
                }
                if (res.data.imageURL) {
                    this.setState({ authorAvatar: JSON.parse(res.data.imageURL) })
                }
            }.bind(this))
            .catch(function (err) {

            })
    }

    saveEdit() {
        this.props.blogActions.updateBlog({ editMode: true })
        localStorage.removeItem('editBlog')
    }

    getComments() {
        axios.post(env.httpURL, {
            'queryMethod': 'getComments',
            'queryData': { postID: this.props.blog._id }
        }
        )
            .then(o => {
                this.setState({ comments: o.data.comments })
            })
            .catch(e => {
                console.log(e)
            })
    }

   

    updateViews = () => {
        axios.post(env.httpURL, {
            'queryMethod': 'updateViews',
            'queryData': {
                _id: this.props.blog._id
            }
        })
            .then((o) => {
            })
            .catch((err) => {
                return false
            })
    }

    componentDidMount() {
        this.getComments()
        this.handleEditorStateEdit()
        this.props.blogActions.updateBlog({ editMode: false })
        if (this.props.blog) {
            this.getAauthorAvatar()
        }
        this.setState({ youLike: true })
        if (localStorage.getItem('user')) {
            this.setState({ userLoggedIn: true })
            axios.post(env.httpURL, {
                'queryMethod': 'getLike',
                'queryData': {
                    postID: this.props.blog.id,
                    title: this.props.blog.title,
                    userID: JSON.parse(localStorage.getItem('user')).id
                }
            })
                .then(function (response) {
                    if (!response.data) {
                        this.setState({ youLike: false })
                        return false
                    }
                    if (!response.data.state) {
                        this.setState({ youLike: false })
                        return false
                    }
                    if (response.data.state === false) {
                        this.setState({ youLike: false })
                        return false
                    }
                    if (response.data.state === true) {
                        if (response.data.n) {
                            this.setState({ youLike: true })
                            return true
                        } else {
                            return false
                        }
                    }
                }.bind(this))
                .catch(function (err) {
                    this.setState({ youLike: false })
                    return false
                }.bind(this))
        }
    }

    fbShare() {
        let fbShareURL = 'https://www.facebook.com/sharer/sharer.php?u=' + this.state.blogUrl.shortUrl
        if (this.props.blog) {
            let postURL = this.state.blogUrl.pathname
            let shareURL = fbShareURL + "&amp;src=sdkpreparse'"
            window.open(shareURL, 'sharer', 'toolbar=0,status=0,width=548,height=325')
        }
    }

    tweetShare() {
        if (this.props.blog) {
            let hashTgs = '%2F&hashtags=' + this.props.blog.topics.join(',')
            let via = '&via=zemuldo'
            let related = '&related=https%3A%2F%2Fpic.twitter.com/Ew9ZJJDPAR%2F'
            let url = `&url=https%3A%2F%2F${this.state.blogUrl.shortUrl_Bare}`
            let fullURL = `${url}${related}${via}`
            let shareURL = 'https://twitter.com/intent/tweet?text=pic.twitter.com/Ew9ZJJDPAR ' + this.props.blog.title + fullURL
            window.open(shareURL, 'sharer', 'toolbar=0,status=0,width=548,height=325')
        }
    }

    gplusShare() {
        if (this.props.blog) {
            window.open(`https://plus.google.com/share?url=https://blog.zemuldo.com/&url=https%3A%2F%2F${this.state.blogUrl.shortUrl_Bare}`)
        }
    }

    linkdnShare() {
        let url = `https://plus.google.com/share?url=https://blog.zemuldo.com/&url=https%3A%2F%2Fblog.zemuldo.com/${this.state.blogUrl}`
        window.open('https://www.linkedin.com/cws/share?url=https%3A%2F%2Fblog.zemuldo.com  /' + url, '', 'height=550,width=525,left=100,top=100,menubar=0')
    }

    updateLikes = (id) => {
        if (localStorage.getItem('user')) {
            return axios.post(env.httpURL, {
                'queryMethod': 'updateBlogLikes',
                'queryData': {
                    id: id,
                    title: this.props.blog.title,
                    userID: JSON.parse(localStorage.getItem('user')).id
                }
            })
                .then(function (response) {
                    if (response.data.state === false) {
                        return
                    }
                    if (response.data.n) {
                        if (response.data.n) {
                            this.props.blogActions.updateBlog({ likes: 1 + this.props.blog.likes })
                            this.setState({ youLike: true })
                        }
                    }
                }.bind(this))
                .catch(function (err) {
                })
        }
    };
    deletBlog = (id) => {
        if (localStorage.getItem('user')) {
            return axios.post(env.httpURL, {
                'queryMethod': 'deleteBlog',
                'queryData': {
                    id: id
                }
            })
                .then(function (response) {
                    this.props.blogActions.resetBlog({ id: null })
                    this.props.navigateBlogs({})
                }.bind(this))
                .catch(function (err) {
                }.bind(this))
        }
    };

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
        this.props.blogActions.updateBlog({ [e.target.name]: e.target.value })
    }

    handleSave = () => {
        let body = localStorage.getItem('editBlog')
        let update = {
            title: this.state.title,
            wordCount: this.props.blog.wordCount,
            about: this.props.blog.about,
            topics: this.props.blog.topics,
            type: this.props.blog.type
        }
        let o = { editMode: false, title: this.state.title }
        update.body = this.props.blog.body
        if (body) {
            o.body = body
            update.body = body
        }

        this.props.blogActions.updateBlog(o);
        axios.post(env.httpURL, {
            queryMethod: 'updateBlog',
            'queryData': {
                _id: this.props.blog.postID,
                update: update
            }

        })
            .then(function (o) {
                localStorage.removeItem('editBlog')
            }.bind(this))

            .catch(function (err) {

            }.bind(this))
    }

    setReplyComment(_id) {
        if (!this.props.user || !this.props.user._id) {
            this.setState({ open: true })
            return false
        }
        this.setState({ replyComment: _id })
    }

    deleteComments(_id) {
        axios.post(env.httpURL, {
            queryMethod: 'deleteComment',
            'queryData': {
                postID: this.props.blog._id,
                _id: _id
            }
        })
            .then(oo => {
                console.log(oo)
                if (oo.data.nModified === 1) {
                    return deleteComments(_id, this.state.comments)
                }
            })
            .then(o => {
                if (o.constructor === Array) {
                    this.setState({ comments: o })
                    notifyMe('Comment was deleted')
                }
                this.setState({ commentToDelete: null })
            })
            .catch(e => {
                console.log(e)
            })
    }

    onCommentChange = (e) => {
        this.setState({ mess: e.target.value })
    }

    submitComment = () => {
        if (!this.state.mess || this.state.mess.length < 2) {
            return false
        }
        if (!this.props.user) {
            this.setState({ open: true })
            return false
        }

        if (this.state.mess.length > 1) {
            axios.post(env.httpURL, {
                queryMethod: "comment",
                queryData: {
                    postID: this.props.blog._id,
                    author: {
                        name: this.props.user.name,
                        avatar: this.props.user.avatarURL,
                    },
                    userID: this.props.user._id,
                    mess: this.state.mess,
                }
            })
                .then(o => {
                    this.setState({
                        comments: [...this.state.comments, {
                            author: {
                                name: this.props.user.name,
                                avatar: this.props.user.avatarURL,
                            },
                            postID: this.props.blog._id,
                            _id: o.data._id,
                            mess: this.state.mess,
                            date: new Date().toISOString()
                        }], mess: ''
                    })
                })
                .catch(e => {
                    console.log(e)
                })
        }

    }

    updateComments = (c) => {
        let o = this.state.comments;
        this.setReplyComment('')
        axios.post(env.httpURL, {
            queryMethod: "replyComment",
            queryData: c
        })
            .then(oo => {
                c._id = oo.data._id
                return updateReplies(c, o)
            })
            .then(oo => {
                this.setState({ comments: oo })
            })
            .catch(e => {
                console.log(e)
            })

    }

    handleFormField = (e) => {
        e.preventDefault()
        this.setState({ [e.target.name]: e.target.value })
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
        axios.post(env.httpURL, {
            'queryMethod': 'loginUser',
            'queryData': userData
        })
            .then(function (success) {
                if (!success.data) {
                    this.setState({
                        error: true,
                        hideMessage: false,
                        errorDetails: { field: 'Login', message: 'An error occurred, Check your Internet' }
                    })
                    setTimeout(function () {
                        this.setState({ error: false, hideMessage: true })
                    }.bind(this), 2000)
                    return false
                }
                if (success.data.id) {
                    let user = success.data
                    success.data.name = success.data.userName
                    this.setState({ logingin: false })
                    this.props.userActions.updateUser(user)
                    localStorage.setItem('user', JSON.stringify(success.data))
                    this.setState({ open: false })
                } else {
                    this.setState({
                        error: true,
                        hideMessage: false,
                        logingin: false,
                        errorDetails: { field: 'Login', message: success.data.error }
                    })
                    setTimeout(function () {
                        this.setState({ error: false, hideMessage: true })
                    }.bind(this), 2000)
                }
            }.bind(this))
            .catch(function (e) {
                console.log(e)
                this.setState({
                    error: true,
                    hideMessage: false,
                    logingin: false,
                    errorDetails: { field: 'Login', message: 'An erro occured, Check your Internet' }
                })
                setTimeout(function () {
                    this.setState({ error: false, hideMessage: true })
                }.bind(this), 2000)
            }.bind(this))
    }

    stickOverlay = () => this.setState({ overlayFixed: true })

    stickTopMenu = () => this.setState({ menuFixed: true })

    unStickOverlay = () => this.setState({ overlayFixed: false })

    unStickTopMenu = () => this.setState({ menuFixed: false })

    render() {
        const { menuFixed, overlayFixed, overlayRect } = this.state
        const { open, dimmer } = this.state
        const BlogComments = (arr) => {
            return (
                <Comment.Group threaded>
                    {arr.map(function (c) {
                        return (
                            <Comment key={c._id}>
                                <Comment.Avatar as='a' src={env.httpURL + c.author.avatar} />
                                <Comment.Content>
                                    <Comment.Author as='a'>{c.author.name}</Comment.Author>
                                    <Comment.Metadata>
                                        <span>{moment().to(c.date)}</span>
                                    </Comment.Metadata>
                                    <Comment.Text>{c.mess}</Comment.Text>
                                    <Comment.Actions>
                                        <Button icon basic color='green' onClick={() => this.setReplyComment(c._id)} circular icon='reply' />
                                        {
                                            this.props.user && this.props.user._id && this.props.user._id === c.userID ?
                                                <Button icon basic color='red' onClick={() => this.showDeleteComment(c._id)} circular icon='delete' /> : null
                                        }
                                        {
                                            this.state.replyComment === c._id ?
                                                <Form reply>
                                                    <Form.TextArea onChange={this.onCommentChange} />
                                                    <Button
                                                        onClick={() => this.updateComments({
                                                            postID: this.props.blog._id,
                                                            parent_id: c._id,
                                                            mess: this.state.mess,
                                                            userID: this.props.user._id,
                                                            author: {
                                                                name: this.props.user.name,
                                                                avatar: this.props.user.avatarURL
                                                            }
                                                        })}
                                                        content='Add Reply'
                                                        labelPosition='left'
                                                        icon='edit'
                                                        primary
                                                    />
                                                    <Button onClick={() => this.setReplyComment('')} content='Cancel'
                                                        labelPosition='left' icon='close' primary />
                                                </Form> : null
                                        }
                                    </Comment.Actions>
                                </Comment.Content>
                                {
                                    c.chat ?
                                        BlogComments(c.chat.comments) : null
                                }
                            </Comment>)
                    }.bind(this))}
                </Comment.Group>)

        };
        let comments = [
            {

                menuItem: 'Comments',
                render: () =>
                    <div>
                        {
                            BlogComments(this.state.comments)
                        }
                        <Form>
                            <Form.TextArea style={{ maxWidth: '400px' }} onChange={this.onCommentChange} />
                            <Button disabled={!this.state.mess || this.state.mess.length < 2} onClick={() => this.submitComment('')} content='Add Comment' labelPosition='left'
                                icon='edit' primary />
                        </Form>
                    </div>
            },
            {
                menuItem: 'Facebook',
                render: () =>
                    <FacebookProvider key={'1303236236454786'} appId="1303236236454786"><Comments
                        href={`https://blogs.zemuldo.com/${this.state.blogUrl}`} />
                    </FacebookProvider>
            },
            {
                menuItem: 'Disqus',
                render: () =>
                    <DisqusThread
                        key={'zemuldoblog'}
                        shortname="zemuldoblog"
                        identifier={this.props.blog._id}
                        title={`Zemuldo Blogs- ${this.props.blog.title}`}
                    />
            }
        ]
        
        return (
            <div>
                {
                    this.props.blog
                        ? <div>
                            <div style={{ margin: '0em 0em 3em 0em', fontSize: '16px', fontFamily: 'georgia' }}>
                                {
                                    this.state.editorState ?
                                        <BlogEditor initEditorState={this.state.editorState} mode={'edit'}
                                            className='editor' editorState={this.props.blog.body} /> :
                                        <div>Loading state</div>
                                }
                            </div>
                            <div>
                                {
                                    this.props.blog.editMode ?
                                        <Form style={{ padding: '2em 2em 2em 2em' }}>
                                            <Form.TextArea name='about' maxLength='140' onChange={this.handleFormFieldEdit}
                                                label='About your blog'
                                                defaultValue={this.props.blog.about} />
                                            <Form.Field>
                                                <Label style={{ border: 'none' }} as='a' size='large' color='blue'>Select
                                                    Tags</Label>{'   '}
                                                <Dropdown defaultValue={this.props.blog.topics} name='topics' style={{ margin: '0em 0em 1em 0em', color: 'green' }}
                                                    onChange={this.handleFormFieldEdit} multiple search selection
                                                    closeOnChange options={topics} placeholder='Select topics' />
                                            </Form.Field>
                                            <Form.Field inline>
                                                <Label style={{ border: 'none' }} as='a' size='large' color='blue'>Select
                                                Category</Label>{'   '}
                                                <Select defaultValue={this.props.blog.type} name='type' style={{ margin: '0em 0em 1em 0em', color: 'green' }}
                                                    onChange={this.handleFormFieldEdit} placeholder='Select Category'
                                                    options={categories} />
                                            </Form.Field>
                                        </Form>
                                        : null
                                }
                            </div>
                        </div>
                        : <div>
                            Content not found!
                        </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        blog: state.blog,
        vars: state.vars,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        blogActions: bindActionCreators(BlogActions, dispatch),
        userActions: bindActionCreators(UserActions, dispatch),
    }
}

Blog.propTypes = {
    blog: PropTypes.object.isRequired,
    user: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null])
    ]),
    vars: PropTypes.object.isRequired,
    blogActions: PropTypes.object.isRequired,
    navigateBlogs: PropTypes.func.isRequired

}

export default connect(mapStateToProps, mapDispatchToProps)(Blog)
