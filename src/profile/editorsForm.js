import React, { Component } from 'react';
import {connect } from 'react-redux';
import {Label, Header,Form,Select,Dropdown} from 'semantic-ui-react'
import Creator from '../blogEditor/createBlog'
import * as VarsActions from "../state/actions/vars";
import {bindActionCreators} from "redux";
const categories = [
    { key: 'dev', value: 'Development', text: 'Development',name:'development' },
    { key: 'tech', value: 'Technology', text: 'Technology' ,name:'technology'},
    { key: 'business', value: 'Business', text: 'Business' ,name:'business'},
]
const topics = [
    { key: 'bigdata', value: 'bigdata', text: 'bigdata', name: 'bigdata'},
    { key: 'iot', value: 'iot', text: 'iot' ,name: 'iot'},
    { key: 'ml', value: 'ml', text: 'ml' ,name: 'ml'},
    { key: 'ai', value: 'ai', text: 'ai' ,name: 'ai'},
    { key: 'java', value: 'java', text: 'java' ,name: 'java'},
    { key: 'python', value: 'python', text: 'python' ,name: 'python'},
    { key: 'javascript', value: 'javascript', text: 'javascript' ,name: 'javascript'},
    { key: 'r', value: 'r', text: 'r' ,name: 'r'},
    { key: 'marketing', value: 'marketing', text: 'marketing' ,name: 'marketing'},
    { key: 'fintech', value: 'fintech', text: 'fintech' ,name: 'fintech'},
    { key: 'startup', value: 'startup', text: 'startup' ,name: 'startup'},
    { key: 'bot', value: 'bot', text: 'bot' ,name: 'bot'},
    { key: 'linux', value: 'linux', text: 'linux' ,name: 'linux'},
    { key: 'go', value: 'go', text: 'go' ,name: 'go'},
    { key: 'growth haking', value: 'growth haking', text: 'growth haking' ,name: 'growth haking'},
    { key: 'cloud', value: 'cloud', text: 'cloud' ,name: 'cloud'},
    { key: 'nodejs', value: 'nodejs', text: 'nodejs' ,name: 'nodejs'},
    { key: 'express', value: 'express', text: 'express' ,name: 'express'},
    { key: 'mongodb', value: 'mongodb', text: 'mongodb' ,name: 'mongodb'},
    { key: 'sql', value: 'sql', text: 'sql' ,name: 'sql'},
    { key: 'adf', value: 'adf', text: 'adf' ,name: 'adf'},
    { key: 'git', value: 'git', text: 'git' ,name: 'git'},
    { key: 'react', value: 'react', text: 'react' ,name: 'react'},
    { key: 'ui', value: 'ui', text: 'ui' ,name: 'ui'},
    { key: 'ux', value: 'ux', text: 'ux' ,name: 'ux'},
    { key: 'angular', value: 'angular', text: 'angular' ,name: 'angular'},
    { key: 'e-commerce', value: 'e-commerce', text: 'e-commerce' ,name: 'e-commerce'},
    { key: 'code', value: 'code', text: 'code' ,name: 'code'},
    { key: 'programming', value: 'programming', text: 'programming' ,name: 'programming'},
    { key: 'wearables', value: 'wearables', text: 'wearables' ,name: 'wearables'},
    { key: 'laptops', value: 'laptops', text: 'laptops' ,name: 'laptops'},
    { key: 'phones', value: 'phones', text: 'phones' ,name: 'phones'},
    { key: 'hadoop', value: 'hadoop', text: 'hadoop' ,name: 'hadoop'},
    { key: 'servers', value: 'servers', text: 'servers' ,name: 'servers'},
    { key: 'analytics', value: 'analytics', text: 'analytics' ,name: 'analytics'},
    { key: 'devops', value: 'devops', text: 'devops' ,name: 'devops'},
    { key: 'datascience', value: 'datascience', text: 'datascience' ,name: 'datascience'},
    { key: 'seo', value: 'seo', text: 'seo' ,name: 'seo'},
    { key: 'html-css', value: 'html-css', text: 'html-css' ,name: 'html-css'},
    { key: 'oracle', value: 'oracle', text: 'oracle' ,name: 'oracle'},
    { key: 'pentesting', value: 'pentesting', text: 'pentesting' ,name: 'pentesting'},
    { key: 'security', value: 'security', text: 'security' ,name: 'security'}
];
class EditorsForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            category:null,
            topics:[],
            termsAccept:false,
            about:'',
            dialogInComplete:true,
        };
        this.handleTopicChange = this.handleTopicChange.bind(this);
        this.handleUTAChange = this.handleUTAChange.bind(this);
        this.handleAboutChange=this.handleAboutChange.bind(this)
        this.onFinishClick = this.onFinishClick.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
    };
    componentDidMount() {
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }
    handleCategoryChange(e,data){
        this.setState({category:data.value,dialogInComplete:(this.state.topics && this.state.category && this.state.termsAccept)});
    }
    handleAboutChange(e,data){
        this.setState({about:data.value,dialogInComplete:(this.state.topics && this.state.category && this.state.termsAccept)})
    }
    handleTopicChange(e,data){
        this.setState({topics:data.value,dialogInComplete:(this.state.topics && this.state.category && this.state.termsAccept)});
    }
    handleUTAChange(e,data){
        this.setState({termsAccept:data.checked,dialogInComplete:(this.state.topics && this.state.category && this.state.termsAccept)});
    }
    onFinishClick(){
        let blogDta = {
            type:this.state.category,
            topics:this.state.topics,
            about:this.state.about
        }
        window.localStorage.setItem('blogData',JSON.stringify(blogDta))
        this.setState({filledForm:false})
        this.updateVars([{key:'editingMode',value:true}]);
    }
    updateVars(vars){
        let newVars = this.props.vars;
        for(let i=0;i<vars.length;i++){
            newVars[vars[i].key]=vars[i].value
        }
        this.props.varsActions.updateVars(newVars);
    };
    render() {
        return (
            <div>
                {
                    !this.props.vars.editingMode?
                        <div>
                            <Header color='green' as='h3'>
                                Creating your Article is easy. Save and continue where you left..
                            </Header>
                            Lets get a few things ready first. this.
                            Fill the form below to feed details of your article.
                            <Form style={{padding:'2em 2em 2em 2em'}}>
                                <br/>
                                <Form.Group widths='equal'>
                                    <Form.Field inline>
                                        <Label style={{border:'none'}} as='a' size="large" color='blue'>Select Category</Label>{'   '}
                                        <Select style={{margin:'0em 0em 1em 0em',color:'green'}}  onChange={this.handleCategoryChange} placeholder='Select Category' options={categories} />
                                    </Form.Field>
                                </Form.Group>
                                <Form.Group inline>
                                    <Form.Field>
                                        <Label  style={{border:'none'}} as='a' size="large" color='blue'>Select Tags</Label>{'   '}
                                        <Dropdown style={{margin:'0em 0em 1em 0em',color:'green'}} onChange={this.handleTopicChange} multiple search selection closeOnChange options={topics} placeholder='Select topics' />
                                    </Form.Field>
                                </Form.Group >
                                <Form.TextArea maxLength="140" onChange={this.handleAboutChange} label='About your blog' placeholder='Small details about your article...upto 140 Characters' />
                                <Form.Checkbox onChange = {this.handleUTAChange} label='I agree to the Community Terms and Conditions' />
                                <Form.Button disabled={this.state.topics.length<1 || this.state.about.length<139 || !this.state.category || !this.state.termsAccept} type="button" onClick={this.onFinishClick}  color='green' size='large'>Submit</Form.Button>
                                <Form.Button type="button" onClick={()=>this.updateVars([{key:'editingMode',value:false},{key:'createNew',value:false}])}  color='green' size='large'>Exit</Form.Button>
                            </Form>
                        </div>:
                        <Creator
                            currentUser = {this.props.currentUser}
                            topics={this.state.topics}
                            category={this.state.category}
                        />
                }
            </div>

        )
    }
}

const mapStateToProps = (state) => {
    return {
        vars:state.vars
    }
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        varsActions:bindActionCreators(VarsActions,dispatch)
    }
};

export default connect(mapStateToProps,mapDispatchToProps) (EditorsForm);
