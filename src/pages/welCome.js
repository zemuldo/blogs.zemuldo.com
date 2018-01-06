import React from 'react'
import {connect} from 'react-redux'
import {Loader, Header} from 'semantic-ui-react'
import Blog from '../posts/blog'
import GridBlogs from "../posts/gridBlogs";
import {pages} from '../environments/conf'

class WelcomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
    }

    fbShare() {
        let fbShareURL = 'https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fzemuldo.com%2F';
        if (this.props.blog) {
            let postURL = this.props.blog.title.split(' ').join('%2520') + '_' + this.props.blog.date.split(' ').join('%2520') + '_' + this.props.blog.id.toString();
            let shareURL = fbShareURL + postURL + "&amp;src=sdkpreparse'"
            window.open(shareURL, 'sharer', 'toolbar=0,status=0,width=548,height=325');
        }
    }

    tweetShare() {
        if (this.props.blog) {
            let hashTgs = '%2F&hashtags=' + this.props.blog.topics.join(',');
            let via = '&via=zemuldo';
            let related = '&related=http%3A%2F%2Fpic.twitter.com/Ew9ZJJDPAR%2F';
            let url = '&url=http%3A%2F%2Fzemuldo.com/' + this.props.blog.title.split(' ').join('-') + '_' + this.props.blog.date.split(' ').join('-') + '_' + this.props.blog.id.toString()
            let fullURL = url + related + hashTgs + via
            let shareURL = 'https://twitter.com/intent/tweet?text=pic.twitter.com/Ew9ZJJDPAR ' + this.props.blog.title + fullURL
            window.open(shareURL, 'sharer', 'toolbar=0,status=0,width=548,height=325');

        }
    }

    gplusShare() {
        window.open('https://plus.google.com/share?url=http://zemuldo.com/' + this.props.blog.title.split(' ').join('-'), "", "height=550,width=525,left=100,top=100,menubar=0");
        return false;
    }

    linkdnShare() {
        window.open('https://www.linkedin.com/cws/share?url=http%3A%2F%2Fzemuldo.com/' + this.props.blog.title.split(' ').join('-') + '_' + this.props.blog.id.toString(), "", "height=550,width=525,left=100,top=100,menubar=0");
    }

    render() {
        return (
            <div style={{margin: '2em 1em 3em 1em'}}>
                {
                    !this.props.blog.id ?
                        <div>
                            {
                                this.props.blogs[0] ?
                                    <div>
                                        <Header color={this.props.vars.color} as='h2'>
                                            {pages[this.props.vars.currentLocation].topTitle}
                                        </Header>
                                        <hr color="green"/>
                                        <br/>
                                        <GridBlogs
                                            x={this.props.x}
                                            next={this.props.next}
                                            setPreviousBlogs={this.props.setPreviousBlogs}
                                            setNextBlogs={this.props.setNextBlogs}
                                            onReadMore={this.props.onReadMore}
                                            color={this.props.vars.color}
                                        />
                                    </div> :
                                    <div>
                                        <Header color={this.props.vars.color} as='h1'>
                                            {pages[this.props.vars.currentLocation].topTitle}
                                        </Header>
                                        <hr color="green"/>
                                        <div style={{
                                            fontSize: "16px",
                                            fontFamily: "georgia",
                                            padding: '0em 0em 2em 1em'
                                        }}>
                                            <p>
                                                There is no content on the topic yet. You can explore more
                                            </p>
                                        </div>
                                    </div>
                            }
                        </div> : null
                }
                {
                    !this.props.blog.id ?
                        null :
                        <div>
                            {
                                this.props.vars.blogsLoaded ?
                                    <Blog
                                        color={this.props.vars.color}
                                        counts={this.props.counts}
                                        deletedBlog={this.props.deletedBlog}
                                    /> :
                                    <div style={{left: '50%', position: 'fixed', bottom: '50%', zIndex: -1}}>
                                        <Loader active inline='centered'/>
                                        <p>Loading Blogs...</p>
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
        blogs: state.blogs,
        blog: state.blog,
        vars: state.vars
    }
}

export default connect(mapStateToProps)(WelcomePage)