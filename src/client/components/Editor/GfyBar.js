import React from 'react';
import PropTypes from 'prop-types';
const Gfycat = require('gfycat-sdk');
var gfycat = new Gfycat({client_id: "2_rzQK14", client_secret:"mACyoHF388DsxKWzOa4DMKX5sdLhvh4CvtN28UKwUGaOBoAvuPGoCY0KmIajx2a4"});
import { Form, Input, Button } from 'antd';
import { injectIntl, FormattedMessage } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './GfyBar.less';


class GfyBar extends React.Component {

    constructor(props) {
        super(props);
    
        this.state = {
            searchData: {},
        };
        this.onGfySearch = this.onGfySearch.bind(this);
        this.handleCopyClick = this.handleCopyClick.bind(this);
      }

    onGfySearch(e) {
        e.preventDefault();
        
        const newSearch = document.getElementById("GfySearch");
        const form = document.getElementById("GfyForm");
        if (newSearch.value != "") {
            let options = {
            search_text: newSearch.value || "reaction",
            count: 8,
            };
            
            gfycat.search(options).then(data => {
            //console.log('gfycats', data);
            this.setState({
                searchData: data,
            });
            });
            form.reset();
        }
    }

    handleCopyClick() {
        this.setState({ copied: true });
      }

    render() {
        const { searchData } = this.state;
        //console.log("searchdata", searchData);
        const copyMessage = this.state.copied ? (
            <FormattedMessage id="image_copied" defaultMessage="Link Copied" />
          ) : (
            <FormattedMessage id="image_copy" defaultMessage="Click to copy image link" />
          );

        return (
            <div className="GfyBar">
            <Form className="GfyBar__form" id="GfyForm"> 
                <Input
                type="text"
                className="GfyBar__input"
                id="GfySearch"
                placeholder="Search for gfys"
                />
                <Button onClick={this.onGfySearch}> GfySearch </Button>
            </Form>
                <div className="GfyBar__gfys">
                    {!!searchData.gfycats && copyMessage}
                    {!!searchData.gfycats && searchData.gfycats.map(gif => 
                    <CopyToClipboard text={gif.gifUrl} onCopy={this.handleCopyClick} key={gif.gfyNumber}>
                        <span className="GfyBar__copy"> <img className="GfyBar__image" src={gif.gifUrl}/> </span>
                    </CopyToClipboard>  
                    )}
                </div>
           
            
            </div>
        );
    }
}

export default GfyBar;