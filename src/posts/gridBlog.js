import React from 'react'
import { Card, Button, Header, Image, Icon, Segment, Divider, Popup } from 'semantic-ui-react'
import { topicsOBJ } from '../env'
import PropTypes from 'prop-types'
import moment from 'moment'
import * as VarsActions from '../store/actions/vars'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux'

const getTopiINfo = (topics) => {
  let info = []
  topics.forEach(function (topic) {
    info.push(topicsOBJ[topic].name)
  })
  return info
}

class GridBlog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showInfo: false
    }
  }

  handleUserProfle =(user)=>{
    this.props.varsActions.updateVars({view_user:user})
    this.props.history.push(`/profile/${user.userName}`)
  }

  handleClickBlog = (path,blog)=>{
    this.props.varsActions.updateVars({currentBlog:blog})
    this.props.history.push(path)
  }

  render() {
    let o = this.props.blog
    let w = Math.round((o.wordCount / 130))
    let p = '/' + o.type + '/' + o.topics[0] + '/' + o.author.userName + '-' + o.title.split(' ').join('-') + '-' + o.date.split(' ').join('-') + '-' + o.id.toString()
    return (
      <Card

        className='blogCard' style={{
          width: 'auto',
          maxWidth: '300px',
          minWidth: '100px',
          position: "relative"
        }}
      >
        <Card.Content>
          <Card.Header>
            <a onClick={()=>this.handleClickBlog(p,o)}>
              <Header color='green' as='h3'>
                {o.title.split(' ').join(' ')}
              </Header>
            </a>
          </Card.Header>
          <Card.Meta>
            <span>
              <Icon size='small' inverted circular color='blue' name='thumbs up' />
              <sup>{o.likes}</sup>
            </span>
            <span>
              <Icon size='small' inverted circular color='blue' name='eye' />
              <sup>{o.views}</sup>
            </span>
          </Card.Meta>
          <Divider horizontal>{o.type}</Divider>
          <Card.Description onClick={()=>this.handleClickBlog(p,o)} >
            <a style={{ color: 'black' }}>
              <p>{o.about}</p>
              <p>
                <br/>
                Related Topics
                  <br />
                {getTopiINfo(o.topics).join(', ')}
                <br />
                {
                  o.updated ?
                    <span>
                      Last updated  {moment().to(o.updated)}
                    </span> : <span>
                      Published  {moment().to(o.date)}
                    </span>
                }

              </p>
            </a>
          </Card.Description>
          <br />
          <a onClick={()=>this.handleUserProfle(o.author)}>
            <Popup
              trigger={<Image
                size='big'
                avatar
                rounded
                style={{ maxHeight: '130px' }}
                alt={'blogs image'}
                src={this.props.vars.env.httpURL + o.author.url}
              />}
              content={o.author.name + ', Joined ' + moment().to(o.author.created)}
            />
          </a>

          <span className='info'>
            {o.author.name} {' '}
          </span>
          <br />
          <span>
            {moment(o.date).format('ll')}
          </span>{', '}
          <span className='colorGreen'>
            {w > 60 ? Math.round((w / 60)) + 'Hours,' + w % 60 + ' ' : w + ' '} Minutes read
            </span>
          <br />
          <a onClick={() => alert('Bookmarking is coming soon, sit tight')}>
            <Popup
              trigger={<Image
                floated='right'
                avatar
                alt={'blogs image'}
                src={this.props.vars.env.static + 'img/blogs/bookmark.png'}
              />}
              content='Bookmark, Read later'
            />
          </a>
        </Card.Content>
      </Card>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    vars: state.vars,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
      varsActions: bindActionCreators(VarsActions, dispatch),
  }
}

GridBlog.propTypes = {
  blog: PropTypes.object.isRequired,
  vars: PropTypes.object.isRequired,
  varsActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps,mapDispatchToProps)(GridBlog)
