import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { Checkbox, Form, Input, Select, Button} from 'antd';
import { Link } from 'react-router-dom';
import { rewardsValues } from '../../../common/constants/rewards';
import { boardValues } from '../../../common/constants/boards';
import Action from '../Button/Action';
import requiresLogin from '../../auth/requiresLogin';
import withEditor from './withEditor';
import EditorInput from './EditorInput';
import { remarkable } from '../Story/Body';
import BodyContainer from '../../containers/Story/BodyContainer';
import './Editor.less';
import ScrollToTopOnMount from '../Utils/ScrollToTopOnMount';

@injectIntl
@requiresLogin
@Form.create()
@withEditor
class Editor extends React.Component {
  static propTypes = {
    user: PropTypes.shape().isRequired,
    intl: PropTypes.shape().isRequired,
    form: PropTypes.shape().isRequired,
    title: PropTypes.string,
    topics: PropTypes.arrayOf(PropTypes.string),
    board: PropTypes.string,
    body: PropTypes.string,
    access: PropTypes.string,
    accessList: PropTypes.array,
    link: PropTypes.string,
    commentPrice: PropTypes.string,
    reward: PropTypes.string,
    upvote: PropTypes.bool,
    nsfwtag: PropTypes.bool,
    loading: PropTypes.bool,
    isUpdating: PropTypes.bool,
    saving: PropTypes.bool,
    draftId: PropTypes.string,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
    onSubmit: PropTypes.func,
    onError: PropTypes.func,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
  };

  static defaultProps = {
    title: '',
    topics: [],
    board: '',
    body: '',
    accessList: [],
    access: 'public',
    link: '',
    commentPrice: '0',
    reward: rewardsValues.half,
    upvote: true,
    nsfwtag: false,
    recentTopics: [],
    popularTopics: [],
    loading: false,
    isUpdating: false,
    saving: false,
    draftId: null,
    onUpdate: () => {},
    onDelete: () => {},
    onSubmit: () => {},
    onError: () => {},
    onImageUpload: () => {},
    onImageInvalid: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      body: '',
      bodyHTML: '',
      link:'',
      commentPrice: '0',
      access: 'public',
      keyReady: false,
    };

    this.onUpdate = this.onUpdate.bind(this);
    this.setValues = this.setValues.bind(this);
    this.setBodyAndRender = this.setBodyAndRender.bind(this);
    this.throttledUpdate = this.throttledUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.setValues(this.props);
    const { user } = this.props;

    // eslint-disable-next-line react/no-find-dom-node
    const select = ReactDOM.findDOMNode(this.select);
    if (select) {
      const selectInput = select.querySelector('input,textarea,div[contentEditable]');
      if (selectInput) {
        selectInput.setAttribute('autocorrect', 'off');
        selectInput.setAttribute('autocapitalize', 'none');
      }
    }
    let storagekey = "UserMemoKey-"+user.name;
    if (!_.isEmpty(localStorage.getItem(storagekey))) {
      this.setState({
        keyReady: true,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { title, topics, board, body, accessList, access, link, commentPrice, reward, upvote, nsfwtag, draftId } = this.props;
    if (
      title !== nextProps.title ||
      !_.isEqual(topics, nextProps.topics) ||
      body !== nextProps.body ||
      accessList !== nextProps.accessList ||
      access !== nextProps.access ||
      link !== nextProps.link ||
      commentPrice !== nextProps.commentPrice ||
      reward !== nextProps.reward ||
      board !== nextProps.board ||
      upvote !== nextProps.upvote ||
      nsfwtag !== nextProps.nsfwtag ||
      (draftId && nextProps.draftId === null)
    ) {
      this.setValues(nextProps);
    }
  }

  onUpdate() {
    _.throttle(this.throttledUpdate, 200, { leading: false, trailing: true })();
  }

  setValues(post) {
    // NOTE: Used to rollback damaged drafts - https://github.com/busyorg/busy/issues/1412
    // Might be deleted after a while.
    let reward = rewardsValues.half;
    if (
      post.reward === rewardsValues.all ||
      post.reward === rewardsValues.half ||
      post.reward === rewardsValues.none
    ) {
      reward = post.reward;
    }

    this.props.form.setFieldsValue({
      title: post.title,
      board: post.board,
      topics: post.topics,
      body: post.body,
      accessList: post.accessList,
      access: post.access,
      link: post.link,
      commentPrice: post.commentPrice,
      reward,
      upvote: post.upvote,
      nsfwtag: post.nsfwtag,
    });

    this.setBodyAndRender(post.body, post.access, post.accessList);
  }

  setBodyAndRender(body, access, accessList) {
    this.setState({
      body,
      access,
      accessList,
    });
  }

  checkTopics = intl => (rule, value, callback) => {
    if (!value || value.length < 0 || value.length > 10) {
      callback(
        intl.formatMessage({
          id: 'topics_error_count',
          defaultMessage: 'You can only add up to 10 topics.',
        }),
      );
    }

    value
      .map(topic => ({ topic, valid: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(topic) }))
      .filter(topic => !topic.valid)
      .map(topic =>
        callback(
          intl.formatMessage(
            {
              id: 'topics_error_invalid_topic',
              defaultMessage: 'Topic {topic} is invalid.',
            },
            {
              topic: topic.topic,
            },
          ),
        ),
      );

    callback();
  };

  checkLink = intl => (rule, value, callback) => {
    if (value) {
    const valid = /^((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/.test(value);
    if (!valid) {
        callback(
          intl.formatMessage(
            {
              id: 'topics_error_invalid_link',
              defaultMessage: 'Link {link} is invalid.',
            },
            {
              link: value,
            },
          ),
        );
      } 
      else {
        callback();
      }
    }
    else {
      callback();
    }
  };

  checkCommentPrice = intl => (rule, value, callback) => {
    if (value) {
    const valid = /^([0-9]*\.[0-9]+|[0-9]+)$/.test(value);
    if (!valid) {
        callback(
          intl.formatMessage(
            {
              id: 'price_error_invalid_link',
              defaultMessage: 'Comment Price {price} is invalid.',
            },
            {
              price: value,
            },
          ),
        );
      } 
      else {
        const amounttest = (value == 0 || (value >= 0.001 && value <= 1000000));
        if (!amounttest) {
        callback(
          intl.formatMessage(
            {
              id: 'price_error_amount',
              defaultMessage: 'Comment Price {price} should be between 0.001 and 1,000,000',
            },
            {
              price: value,
            },
          ),
        );
      }
      else {
        callback();
      }
      }
    }
    else {
      callback();
    }
  };

  throttledUpdate() {
    const { form } = this.props;
    const values = form.getFieldsValue();
    this.setBodyAndRender(values.body, values.access, values.accessList);

    if (Object.values(form.getFieldsError()).filter(e => e).length > 0) return;

    this.props.onUpdate(values);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) this.props.onError();
      else this.props.onSubmit(values);
    });
  }

  handleDelete(e) {
    e.stopPropagation();
    e.preventDefault();
    this.props.onDelete();
  }

  render() {
    const { intl, form, loading, isUpdating, saving, draftId} = this.props;
    const { getFieldDecorator } = form;
    const { body, access, accessList, keyReady} = this.state;

    //console.log("privatepost:", access);

    return (
      <Form className="Editor" layout="vertical" onSubmit={this.handleSubmit}>
      <ScrollToTopOnMount />
        <Helmet>
          <title>
            {intl.formatMessage({ id: 'write_post', defaultMessage: 'Write post' })} - WeYouMe
          </title>
        </Helmet>
        <Form.Item
          label={
            <span className="Editor__label">
              <FormattedMessage id="title" defaultMessage="Title" />
            </span>
          }
        >
          {getFieldDecorator('title', {
            initialValue: '',
            rules: [
              {
                required: false,
                message: intl.formatMessage({
                  id: 'title_error_empty',
                  defaultMessage: 'title_error_empty',
                }),
              },
              {
                max: 255,
                message: intl.formatMessage({
                  id: 'title_error_too_long',
                  defaultMessage: "Title can't be longer than 255 characters.",
                }),
              },
            ],
          })(
            <Input
              ref={title => {
                this.title = title;
              }}
              onChange={this.onUpdate}
              className="Editor__title"
              placeholder={intl.formatMessage({
                id: 'title_placeholder',
                defaultMessage: 'Post Title:',
              })}
            />,
          )}
        </Form.Item>
        <Form.Item
          label={
            <span className="Editor__label">
              <FormattedMessage id="link" defaultMessage="Link Destination" />
            </span>
          }
        >
          {getFieldDecorator('link', {
            initialValue: '',
            rules: [
              {
                max: 255,
                message: intl.formatMessage({
                  id: 'link_error_too_long',
                  defaultMessage: "Link can't be longer than 255 characters.",
                }),
              },
              { validator: this.checkLink(intl) },
            ],
          })(
            <Input
              ref={link => {
                this.link = link;
              }}
              onChange={this.onUpdate}
              className="Editor__link"
              placeholder={intl.formatMessage({
                id: 'link_placeholder',
                defaultMessage: 'Link Destination:',
              })}
            />,
          )}
        </Form.Item>
        {!keyReady && (
          <Form.Item
            label={
              <span className="Editor__label">
                <FormattedMessage id="key_not_found" defaultMessage="To use and read private posts, please generate your secret key." />
              </span>
            }
          >
            <Link to="/edit-profile" ><Button> Generate your Secret key</Button></Link>
          </Form.Item>
        )}

        <Form.Item
          className={classNames({ Editor__hidden: !keyReady })}
          label={
            <span className="Editor__label">
              <FormattedMessage id="private" defaultMessage="Post Privacy" />
            </span>
          }
          extra={intl.formatMessage({
            id: 'privacy_setting',
            defaultMessage:
              'Choose between posting publicly, or privately. Private posts use encryption to ensure only users on your connections list can read them.',
          })}
        >
          {getFieldDecorator('access', {
            initialValue: this.props.accessList,
          })(
            <Select onChange={this.onUpdate}>
              <Select.Option value={'public'}>
                <i className="iconfont icon-group" />
                <FormattedMessage id="public_post" defaultMessage="Public Post" />
              </Select.Option>
              <Select.Option value={'private'}>
                <i className="iconfont icon-lock" />
                <FormattedMessage id="private_post" defaultMessage="Encrypted Private Post" />
              </Select.Option>
            </Select>,
          )}
        </Form.Item>

        <Form.Item
          label={
            <span className="Editor__label">
              <FormattedMessage id="accesslist" defaultMessage="Edit private post access list:" />
            </span>
          }
          className={classNames({ Editor__hidden: (this.state.access == 'public') || !keyReady })}
          extra={intl.formatMessage({
            id: 'accessList_extra',
            defaultMessage:
              'Separate usernames with spaces. Only lowercase letters, numbers and hyphen character is permitted.',
          })}
        >
          {getFieldDecorator('accessList', {
            initialValue: accessList,
            rules: [
              {
                required: false,
                message: intl.formatMessage({
                  id: 'accesslist_error_empty',
                  defaultMessage: 'Please enter users',
                }),
                type: 'array',
              },
              { validator: this.checkTopics(intl) },
            ],
          })(
            <Select
              ref={ref => {
                this.select = ref;
              }}
              onChange={this.onUpdate}
              className="Editor__accesslist"
              mode="tags"
              placeholder={intl.formatMessage({
                id: 'accesslist_placeholder',
                defaultMessage: 'Add usernames here',
              })}
              dropdownStyle={{ display: 'none' }}
              tokenSeparators={[' ', ',']}
            />,
          )}
        </Form.Item>

        <Form.Item
          label={
            <span className="Editor__label">
              <FormattedMessage id="board" defaultMessage="Board" />
            </span>
          }
        >
        <ScrollToTopOnMount />
          {getFieldDecorator('board')(
            <Select onChange={this.onUpdate}>
              <Select.Option value={boardValues.random}>
                <i className="iconfont icon-emoji" />
                <FormattedMessage id="board_random" defaultMessage="Random" />
              </Select.Option>
              <Select.Option value={boardValues.intro}>
                <i className="iconfont icon-addressbook" />
                <FormattedMessage id="board_intro" defaultMessage="Introductions" />
              </Select.Option>
              <Select.Option value={boardValues.pics}>
                <i className="iconfont icon-picture" />
                <FormattedMessage id="board_pics" defaultMessage="Pictures" />
              </Select.Option>
              <Select.Option value={boardValues.vids}>
                <i className="iconfont icon-playon" />
                <FormattedMessage id="board_vids" defaultMessage="Videos" />
              </Select.Option>
              <Select.Option value={boardValues.news}>
                <i className="iconfont icon-headlines" />
                <FormattedMessage id="board_news" defaultMessage="News" />
              </Select.Option>
              <Select.Option value={boardValues.blog}>
                <i className="iconfont icon-document" />
                <FormattedMessage id="board_blog" defaultMessage="Blog" />
              </Select.Option>
              <Select.Option value={boardValues.music}>
                <i className="iconfont icon-systemprompt" />
                <FormattedMessage id="board_music" defaultMessage="Music" />
              </Select.Option>
              <Select.Option value={boardValues.tech}>
                <i className="iconfont icon-computer" />
                <FormattedMessage id="board_tech" defaultMessage="Technology" />
              </Select.Option>
              <Select.Option value={boardValues.science}>
                <i className="iconfont icon-manage" />
                <FormattedMessage id="board_science" defaultMessage="Science" />
              </Select.Option>
              <Select.Option value={boardValues.politics}>
                <i className="iconfont icon-order" />
                <FormattedMessage id="board_politics" defaultMessage="Politics" />
              </Select.Option>
              <Select.Option value={boardValues.blockchain}>
                <i className="iconfont icon-bitcoin" />
                <FormattedMessage id="board_blockchain" defaultMessage="Blockchain" />
              </Select.Option>
              <Select.Option value={boardValues.games}>
                <i className="iconfont icon-select" />
                <FormattedMessage id="board_games" defaultMessage="Games" />
              </Select.Option>
              <Select.Option value={boardValues.sport}>
                <i className="iconfont icon-activity" />
                <FormattedMessage id="board_sport" defaultMessage="Sport" />
              </Select.Option>
              <Select.Option value={boardValues.links}>
                <i className="iconfont icon-link" />
                <FormattedMessage id="board_links" defaultMessage="Links" />
              </Select.Option>
              <Select.Option value={boardValues.nsfw}>
                <i className="iconfont icon-like" />
                <FormattedMessage id="board_nsfw" defaultMessage="NSFW" />
              </Select.Option>
            </Select>,
          )}
        </Form.Item>
        <Form.Item
          label={
            <span className="Editor__label">
              <FormattedMessage id="topics" defaultMessage="Select Topics:" />
            </span>
          }
          extra={intl.formatMessage({
            id: 'topics_extra',
            defaultMessage:
              'Separate topics with commas. Only lowercase letters, numbers and hyphen character is permitted.',
          })}
        >
          {getFieldDecorator('topics', {
            initialValue: [],
            rules: [
              {
                required: false,
                message: intl.formatMessage({
                  id: 'topics_error_empty',
                  defaultMessage: 'Please enter topics',
                }),
                type: 'array',
              },
              { validator: this.checkTopics(intl) },
            ],
          })(
            <Select
              ref={ref => {
                this.select = ref;
              }}
              onChange={this.onUpdate}
              className="Editor__topics"
              mode="tags"
              placeholder={intl.formatMessage({
                id: 'topics_placeholder',
                defaultMessage: 'Add story topics here',
              })}
              dropdownStyle={{ display: 'none' }}
              tokenSeparators={[' ', ',']}
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('body', {
            rules: [
              {
                required: false,
                message: intl.formatMessage({
                  id: 'story_error_empty',
                  defaultMessage: "Story content can't be empty.",
                }),
              },
            ],
          })(
            <EditorInput
              rows={10}
              onChange={this.onUpdate}
              onImageUpload={this.props.onImageUpload}
              onImageInvalid={this.props.onImageInvalid}
              inputId={'editor-inputfile'}
            />,
          )}
        </Form.Item>
        {body && (
          <Form.Item
            label={
              <span className="Editor__label">
                <FormattedMessage id="preview" defaultMessage="Preview" />
              </span>
            }
          >
            <BodyContainer full body={body} />
          </Form.Item>
        )}
        <Form.Item
          className={classNames({ Editor__hidden: isUpdating })}
          label={
            <span className="Editor__label">
              <FormattedMessage id="reward" defaultMessage="Reward" />
            </span>
          }
          extra={intl.formatMessage({
            id: 'rewards_extra',
            defaultMessage:
              'Choose between 100% POWER or 50% POWER and 50% TSD for your reward payout. POWER increases your voting strength, TSD allows post promotion.',
          })}
        >
          {getFieldDecorator('reward')(
            <Select onChange={this.onUpdate} disabled={isUpdating}>
              <Select.Option value={rewardsValues.all}>
                <FormattedMessage id="reward_option_100" defaultMessage="100% SCORE" />
              </Select.Option>
              <Select.Option value={rewardsValues.half}>
                <FormattedMessage id="reward_option_50" defaultMessage="50% TSD and 50% SCORE" />
              </Select.Option>
              <Select.Option value={rewardsValues.none}>
                <FormattedMessage id="reward_option_0" defaultMessage="Declined" />
              </Select.Option>
            </Select>,
          )}
        </Form.Item>
        <Form.Item className={classNames({ Editor__hidden: isUpdating })}>
          {getFieldDecorator('upvote', { valuePropName: 'checked', initialValue: false })(
            <Checkbox onChange={this.onUpdate} disabled={isUpdating}>
              <FormattedMessage id="like_post" defaultMessage="Like this post" />
            </Checkbox>,
          )}
        </Form.Item>
        <Form.Item className={classNames({ Editor__hidden: isUpdating })}>
          {getFieldDecorator('nsfwtag', { valuePropName: 'checked', initialValue: false })(
            <Checkbox onChange={this.onUpdate} disabled={isUpdating}>
              <FormattedMessage id="nsfw_tag" defaultMessage="Is this post NSFW (Not safe for work)?" />
            </Checkbox>,
          )}
        </Form.Item>
        
        <Form.Item
          label={
            <span className="Editor__label">
              <FormattedMessage id="comment_price" defaultMessage="Comment Price" />
            </span>
          }
        >
          {getFieldDecorator('commentPrice', {
            initialValue: 0,
            rules: [
              {
                max: 20,
                message: intl.formatMessage({
                  id: 'price_error_too_long',
                  defaultMessage: "Price can't be longer than 20 digits.",
                }),
              },
              { validator: this.checkCommentPrice(intl) },
            ],
          })(
            <Input
              ref={commentPrice => {
                this.commentPrice = commentPrice;
              }}
              onChange={this.onUpdate}
              className="Editor__commentPrice"
              placeholder={intl.formatMessage({
                id: 'commentPrice_placeholder',
                defaultMessage: 'Commenting Price:',
              })}
            />,
          )}
        </Form.Item>
        <div className="Editor__bottom">
          <span className="Editor__bottom__info">
            <i className="iconfont icon-markdown" />{' '}
            <FormattedMessage
              id="markdown_supported"
              defaultMessage="Styling with markdown supported"
            />
          </span>
          <div className="Editor__bottom__right">
            {saving && (
              <span className="Editor__bottom__right__saving">
                <FormattedMessage id="saving" defaultMessage="Saving..." />
              </span>
            )}
            <Form.Item className="Editor__bottom__cancel">
              {draftId && (
                <Button type="danger" size="large" disabled={loading} onClick={this.handleDelete}>
                  <FormattedMessage id="draft_delete" defaultMessage="Delete this draft" />
                </Button>
              )}
            </Form.Item>
            <Form.Item className="Editor__bottom__submit">
              {isUpdating ? (
                <Action primary big loading={loading} disabled={loading}>
                  <FormattedMessage
                    id={loading ? 'post_send_progress' : 'post_update_send'}
                    defaultMessage={loading ? 'Submitting' : 'Update post'}
                  />
                </Action>
              ) : (
                <Action primary big loading={loading} disabled={loading}>
                  <FormattedMessage
                    id={loading ? 'post_send_progress' : 'post_send'}
                    defaultMessage={loading ? 'Submitting' : 'Post'}
                  />
                </Action>
              )}
            </Form.Item>
          </div>
        </div>
      </Form>
    );
  }
}

export default Editor;
