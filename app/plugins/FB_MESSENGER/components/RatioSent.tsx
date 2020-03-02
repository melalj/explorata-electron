/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { Table, Select } from 'antd';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

import * as Actions from '../../../state/actions';

const allTime = 'All Time';

class RatioSent extends React.Component {
  constructor(props) {
    super(props);
    this.modelQuery = props.modelQuery;
    this.state = {
      isReady: false,
      typeRatioSent: 'messages',
      yearRatioSent: allTime,
      dataRatioSent: null
    };
  }

  async componentDidMount() {
    const { yearRatioSent, typeRatioSent } = this.state;
    const { isGhosters } = this.props;
    const dataRatioSent = await ipcRenderer.invoke(
      this.modelQuery,
      yearRatioSent === allTime ? null : yearRatioSent,
      typeRatioSent,
      isGhosters
    );
    this.setState({ dataRatioSent, isReady: true });
  }

  async componentDidUpdate(prevProps, prevState) {
    const { yearRatioSent, typeRatioSent } = this.state;
    const { isGhosters } = this.props;
    if (
      prevState.yearRatioSent !== yearRatioSent ||
      prevState.typeRatioSent !== typeRatioSent
    ) {
      const dataRatioSent = await ipcRenderer.invoke(
        this.modelQuery,
        yearRatioSent === allTime ? null : yearRatioSent,
        typeRatioSent,
        isGhosters
      );
      this.setState({ dataRatioSent });
    }
  }

  handleItemClick(d) {
    const { setFirstDrawer } = this.props;
    const filters = { person: d.person };
    setFirstDrawer('FriendProfile', filters);
  }

  render() {
    const { dataRatioSent, isReady, yearRatioSent, typeRatioSent } = this.state;
    const { dataYears, isGhosters } = this.props;

    if (!isReady || !dataRatioSent) return null;

    const yearRatioSentHandler = k => {
      this.setState({ yearRatioSent: k });
    };

    const typeRatioSentHandler = k => {
      this.setState({ typeRatioSent: k });
    };

    const columns = [
      {
        title: 'Name',
        dataIndex: 'person',
        render: text => <a>{text}</a>
      },
      {
        title: '#',
        dataIndex: 'ratio',
        align: 'right',
        render: (text, record) => {
          return `${Number(record.ratio || 0).toFixed(2)} for 1`;
        }
      }
    ];

    return (
      <div>
        <div>
          <div style={{ float: 'right' }}>
            <Select
              defaultValue={typeRatioSent}
              size="default"
              onChange={y => typeRatioSentHandler(y)}
            >
              <Select.Option key="type-0" value="messages">
                Messages
              </Select.Option>
              <Select.Option key="type-1" value="emoji">
                Emojis
              </Select.Option>
              <Select.Option key="type-2" value="photos">
                Photos
              </Select.Option>
              <Select.Option key="type-3" value="gifs">
                GIFs
              </Select.Option>
            </Select>
            <Select
              defaultValue={yearRatioSent}
              size="default"
              onChange={y => yearRatioSentHandler(y)}
            >
              <Select.Option key="0" value={allTime}>
                {allTime}
              </Select.Option>
              {dataYears.map(y => (
                <Select.Option key={y} value={y}>
                  {y}
                </Select.Option>
              ))}
            </Select>
          </div>
          <h2>
            <span role="img" aria-label="emoji" className="emoji">
              {isGhosters ? '👻' : '🗣'}
            </span>
            {isGhosters ? 'Ghosters' : 'Talkers'}
          </h2>
        </div>
        <Table
          columns={columns}
          rowKey="person"
          onRow={record => ({
            onClick: () => this.handleItemClick(record)
          })}
          showHeader={false}
          dataSource={dataRatioSent}
          size="default"
        />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setFirstDrawer: (t, f) => Actions.setFirstDrawer(t, f)
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(RatioSent);
