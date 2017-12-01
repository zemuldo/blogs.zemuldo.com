import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import {Menu,Icon, Dropdown,Input,Image} from 'semantic-ui-react'
import {Link} from 'react-router-dom'

class MainMenu extends Component {
    constructor(props){
        super(props);
        this.state = {
        };
    };
    render() {
        let urlDetails = 'all';
        return (

                <div className='navBar'>
                    <Menu
                        stackable={true}
                        className=''
                        size='tiny'
                        secondary={true}
                        color={this.props.colors[0]}
                        borderless
                    >
                        <Menu.Item
                            as='span'
                            className=''
                            name='home'
                            active={this.props.currentLocation === 'home'}
                            onClick={this.props.handleHomeClick}>
                            <Icon color={this.props.colors[0]} name='home' />
                            <span color={this.props.colors[0]}><Link to="/">Home</Link></span>
                        </Menu.Item>
                        <Menu.Item
                            as='span'
                            name='dev'
                            active={this.props.currentLocation === 'dev'}
                            onClick={this.props.handleMenuItemClick}>
                            <Icon color={this.props.colors[0]} name='code' />
                            <span color={this.props.colors[0]}><Link to={"/dev/"+urlDetails}>Dev</Link></span>
                        </Menu.Item>
                        <Menu.Item
                            as='span'
                            name='business'
                            active={this.props.currentLocation === 'business'}
                            onClick={this.props.handleMenuItemClick}>
                            <Icon color={this.props.colors[0]} name='creative commons' />
                            <span color={this.props.colors[0]}><Link to={"/business/"+urlDetails}>Business</Link></span>
                        </Menu.Item>
                        <Menu.Item
                            as='span'
                            name='tech'
                            active={this.props.currentLocation === 'tech'}
                            onClick={this.props.handleMenuItemClick}>
                            <Icon color={this.props.colors[0]} name='server' />
                            <span color={this.props.colors[0]}><Link to={"/tech/"+urlDetails}>Tech</Link></span>
                        </Menu.Item>
                        <Menu.Item
                            as='span'
                            name='reviews'
                            active={this.props.currentLocation === 'reviews'}
                            onClick={this.props.handleMenuItemClick}>
                            <Icon color={this.props.colors[0]} name='circle notched' />
                            <span color={this.props.colors[0]}><Link to={"/reviews/"+urlDetails}>Reviews</Link></span>
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item
                                name='search'
                                onClick={this.props.handleMenuItemClick}>
                                <Input
                                    icon={<Icon name='search' inverted circular link />}
                                    placeholder='Search...'
                                    onChange={this.props.handleFilterChange}
                                />
                            </Menu.Item>
                            {
                                (!this.props.loggedin) ?
                                    <Menu.Item
                                        as='span'
                                        position='right'
                                        name='login'
                                        color={this.props.colors[0]}
                                        onClick={() => { this.props.handleLoginButton() }}>
                                        <Icon color={this.props.colors[0]} name='unlock' />
                                        <span style={{color:'black'}}><Link to="/login">Login</Link></span>
                                    </Menu.Item>:
                                    <Menu.Item>
                                        <Dropdown
                                            className='dropDown'
                                            trigger={<Image
                                                avatar={true}
                                                wrapped={true}
                                                id="photo"
                                                size='tiny'
                                                src={this.props.profilePic}
                                                style={{
                                                    marginLeft:'50%',
                                                    borderRadius: `${(Math.min(
                                                        JSON.parse(this.props.user.avatar).height,
                                                        JSON.parse(this.props.user.avatar).width
                                                        ) +
                                                        10) *
                                                    (JSON.parse(this.props.user.avatar).borderRadius / 2 / 100)}px`
                                                }}
                                            />}
                                            style={{color:this.props.colors[0]}}
                                            pointing='top right'
                                            item
                                        >
                                            <Dropdown.Menu>
                                                <Dropdown.Item as='span' onClick={this.props._handleSwitchToProfile}>
                                                    <Icon color={this.props.colors[0]} name='user circle' />
                                                    <Link to={'/zemuldo/session'} color={this.props.colors[1]} >Your Profile</Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Icon color={this.props.colors[0]} name='users' />
                                                    <Link to={'/followers'} color={this.props.colors[2]} >Followers</Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Icon color={this.props.colors[0]} name='help' />
                                                    <Link to={'/help'} color={this.props.colors[0]} >Help</Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item  as='span' onClick={this.props._handleCreateNew}>
                                                    <Icon color={this.props.colors[0]} name='plus'  />
                                                    <Link to={'/create'} color={this.props.colors[0]} >New Article</Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span'>
                                                    <Icon color={this.props.colors[0]} name='setting' />
                                                    <Link to={'/settings'} color={this.props.colors[1]} >Settings</Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item as='span' onClick={this.props.handleLogoutinButton}>
                                                    <Icon color={this.props.colors[0]} name='sign out' />
                                                    <Link color={this.props.colors[0]} to="/">Sign Out</Link>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Menu.Item>
                            }
                        </Menu.Menu>
                    </Menu>
                </div>

        )
    }
}
export default  MainMenu