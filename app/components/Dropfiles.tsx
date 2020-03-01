/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { shell } from 'electron';

import { screens } from '../constants';
import { detectDatasetName } from '../utils';
import * as Actions from '../state/actions';

function handleInstructionsClick(e) {
  e.stopPropagation();
  shell.openExternal('https://explorata.io/how');
}

function handleRepoClick(e) {
  e.stopPropagation();
  shell.openExternal('https://www.github.com/melalj/explorata');
}

class Dropfiles extends React.Component {
  async dropHandler(files) {
    const {
      goReport,
      setError,
      setDroppedFiles,
      setLoading,
      setCurrentReport
    } = this.props;

    setLoading(true);

    // Check files
    if (!files.length) {
      setError('No valid file detected'); // TODO: dispatch error
      return null;
    }

    // Detect dataset name
    const datasetName = await detectDatasetName(files);
    if (!datasetName) {
      setError('No dataset detected'); // TODO: dispatch error
      return null;
    }

    setDroppedFiles(files);
    setCurrentReport(datasetName);
    setLoading(false);
    goReport();
    return null;
  }

  render() {
    return (
      <div className="page">
        <Dropzone
          ref={this.dropzoneRef}
          onDrop={f => this.dropHandler(f)}
          accept=".json"
          multiple
        >
          {({ isDragActive, getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              className={classNames('dropzone', {
                'is-active': isDragActive
              })}
            >
              <input
                {...getInputProps()}
                directory=""
                webkitdirectory=""
                nwdirectory=""
              />
              <p>
                {isDragActive
                  ? 'Yes! here...'
                  : 'Drag and drop your “messages” folder here...'}
              </p>
              <div>
                <Button type="primary" size="large">
                  Choose from computer...
                </Button>
                <Button size="large" onClick={e => handleInstructionsClick(e)}>
                  Instructions to get your dataset
                </Button>
              </div>
              <div className="disclaimer">
                Everything is analyzed locally right on your computer.
                <br />
                Explorata do not store or send any information to any external server.
                <br />
                The source code is available on
                <a onClick={e => handleRepoClick(e)}> Github</a>
              </div>
            </div>
          )}
        </Dropzone>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    error: state.error,
    isDatasetReady: state.isDatasetReady,
    isLoading: state.isLoading,
    currentScreen: state.currentScreen
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setError: e => Actions.setError(e),
      setLoading: c => Actions.setLoading(c),
      goReport: () => Actions.setCurrentScreen(screens.DASHBOARD),
      setCurrentReport: r => Actions.setCurrentReport(r),
      setDroppedFiles: f => Actions.setDroppedFiles(f)
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Dropfiles);
