import React from 'react';
import Select from 'react-select';
import './reset.css';
import './App.css';

// ***************************************************************************
// Helper function(s)

var model_options = [
  {"label": "Topic Model", "value": "topic"},
  {"label": "Topic Model (no dialect)", "value": "topic_nodialect"},
  {"label": "Document Clustering", "value": "cluster"},
  {"label": "Document Clustering (no dialect)", "value": "cluster_nodialect"},
]

var meta_options = [
  {"label": "Proportion", "value": "proportion"},
  {"label": "Gender", "value": "gender"},
  {"label": "Race", "value": "race"},
  {"label": "Gender (writer)", "value": "gender_writer"},
  {"label": "Race (writer)", "value": "race_writer"},
]

function ListBar(props) {
  var maxval = Math.max(...props.weights);
  var weights = props.weights.map(val => {
    return(100 * val / maxval)
  })

  return(
    <div
      className={"topic-list-container" + props.class}
      style={{width: props.width}}>
      <div className="topic-list-title">
        <span>{props.title}</span>
      </div>
      <div className="topic-list-row topic-list-row-head">
        <span>{props.titleleft}</span>
        <span>{props.titleright}</span>
      </div>
      {props.items.map( (val, i) => {
        var numcol = null;

        if (props.numcol) {
          numcol = (
            <div className="topic-list-percent">
              <span>{Math.round(props.weights[i]) + "%"}</span>
            </div>
          )
        }

        var clickid = i;
        if (props.clickids) {
          clickid = props.clickids[i];
        }

        var clickfun = props.clickfun;
        var clickclass = "topic-list-row";
        if (!clickfun) {
          clickfun = function() {};
          clickclass = "topic-list-row noclick"
        }

        return(
          <div
            className={clickclass}
            key={i}
            onClick={() => clickfun(clickid)}
            >
            <div
              className="topic-list-text">
              <span>{val}</span>
            </div>
            {numcol}
            <div className="topic-list-size">
            <div
              className="topic-list-inner"
              style={{width: weights[i] + "%"}}>
            </div>
            </div>
          </div>
        )
      })}

    </div>
  )
}

class InterviewTopicBox extends React.Component {

  render() {

    return(
      <div className="topic-meta">
        <div className="interview-btn-grp">
          <button
            onClick={() => {
              window.open("./data/text/" + this.props.doc.id + ".txt");
            }}>
            text
          </button>
          <button
            onClick={() => {
              window.open(this.props.doc.pdf);
            }}>
            pdf
          </button>
        </div>
        <ul>
        <li>
          Title: <span>{this.props.doc.title}</span>
        </li>
        <li>
          Location: <span>{this.props.doc.location}</span>
        </li>
        <li>
          Interviewee: <span>{this.props.doc.interviewee}</span>
        </li>
        <li>
          Writer: <span>{this.props.doc.writer}</span>
        </li>
        </ul>
      </div>
    )
  }
}

class TopicContainer extends React.Component {

  // Override two standard methods of React.Component //

  constructor(props) {
    super(props);
    this.state = {
      td: null,
      interviewmedia: 'meta',
      topicstate: 'grid',
      selectedOption: null,
      selectedMetaOption: {"label": "Proportion", "value": "proportion"},
      topic: 0,
      topicdoc: 0
    }
  }

  componentDidMount() {
  }

  handleChangeTopic(topic) {
    this.setState({
      topic: topic,
      topicstate: 'topic',
    });
  }

  handleChangeTopicDoc(topicdoc) {
    this.setState({
      topicdoc: topicdoc,
      topicstate: 'doc',
    });
  }

  handleChangeTopicstate(value) {
    this.setState({
      topicstate: value,
    });
  }

  handleMediaButton(value) {
    this.setState({
      interviewmedia: value,
    });
  }

  handleSelectMetaChange = (selectedMetaOption) => {
    this.setState({ selectedMetaOption });
  }


  handleSelectChange = (selectedOption) => {
    this.setState({ selectedOption });
    fetch("./data/" + selectedOption.value + ".json").then(res => {
      return res.json()
    }).then(res => {
      this.setState({
        td: res,
        topicstate: 'grid'
      });
    });
  }

  render() {

    var select_box = (<div className="select-group">
              <Select
                options={ model_options }
                className="myselect"
                isSearchable={false}
                placeholder="Select a Model"
                onChange={ this.handleSelectChange }
                value={ this.state.selectedOption }
                />
              <Select
                options={ meta_options }
                className="myselect"
                isSearchable={false}
                placeholder=""
                onChange={ this.handleSelectMetaChange }
                value={ this.state.selectedMetaOption }
                />
            </div>);

    if (!this.state.td) {
      return <div className={"topic-container "}>
        <div className="topic-header">
          <span>Select a Topic or Document Clustering Model</span>
        </div>
        {select_box}
      </div>
    }

    var topicpart = null;

    if (this.state.topicstate === "grid") {
      var weights = this.state.td.all.map(val => {return(val.proportion)});
      var weights_name = "proportion of corpus";

      if (this.state.selectedMetaOption.value === "gender")
      {
        weights = this.state.td.all.map(val => {return(val.proportion_women)});
        console.log(this.state.td.all[0])
        weights_name = "proportion female interviewees";
      }
      if (this.state.selectedMetaOption.value === "race")
      {
        weights = this.state.td.all.map(val => {return(val.proportion_black)});
        console.log(this.state.td.all[0])
        weights_name = "proportion black interviewees";
      }
      if (this.state.selectedMetaOption.value === "gender_writer")
      {
        weights = this.state.td.all.map(val => {return(val.proportion_women_writer)});
        console.log(this.state.td.all[0])
        weights_name = "proportion female writers";
      }
      if (this.state.selectedMetaOption.value === "race_writer")
      {
        weights = this.state.td.all.map(val => {return(val.proportion_black_writer)});
        console.log(this.state.td.all[0])
        weights_name = "proportion black writers";
      }

      topicpart = (
        <div className="topic-part">
          <ListBar
            titleleft="topic"
            titleright={weights_name}
            items={this.state.td.all.map(val => {return(val.description)})}
            weights={weights}
            width="600px"
            clickfun={this.handleChangeTopic.bind(this)}
            numcol={true}
            class=""
          />
        </div>
      );
    }

    if (this.state.topicstate === "topic") {
      topicpart = (
        <div className="topic-part">
          <div style={{width: '900px'}}>
          <ListBar
            title="Associated Words"
            titleleft="word"
            titleright="weight"
            items={this.state.td.topics[this.state.topic].top_word}
            weights={this.state.td.topics[this.state.topic].word_wgt}
            width="250px"
            numcol={false}
            class=""
          />
          <ListBar
            title="Associated Interviews"
            titleleft="interview"
            titleright="proportion in topic"
            items={this.state.td.topics[this.state.topic].top_docs}
            weights={this.state.td.topics[this.state.topic].doc_perc}
            width="400px"
            clickfun={this.handleChangeTopicDoc.bind(this)}
            clickids={this.state.td.topics[this.state.topic].top_docs_ids}
            numcol={true}
            class=" topic-list-two"
          />
          </div>
        </div>
      );
    }
    if (this.state.topicstate === "doc") {
      topicpart = (
        <div>
          <div className="topic-part">
            <ListBar
              titleleft="Topic"
              titleright="proportion of document"
              items={this.state.td.docs[this.state.topicdoc].top_topics}
              weights={this.state.td.docs[this.state.topicdoc].topic_weights}
              clickfun={this.handleChangeTopic.bind(this)}
              clickids={this.state.td.docs[this.state.topicdoc].top_topics_ids}
              width="300px"
              numcol={true}
              class=""
            />
          </div>
          <InterviewTopicBox
            interview={this.state.interview}
            doc={this.state.td.docs[this.state.topicdoc]}
            interviewmedia={this.state.interviewmedia}
            handleMediaButton={this.handleMediaButton.bind(this)}
          />
        </div>
      );
    }

    return (
      <div className={"topic-container "}>
        <div className="topic-header">
          <span>Select a Topic or Document Clustering Model</span>
        </div>
        {select_box}
        <span
          style={{left: "500px", color: "#268bd2", fontSize: "1.2em", cursor: "pointer", marginLeft: "400px"}}
          onClick={() => this.handleChangeTopicstate("grid")}>
          [all topics]
        </span>
        {topicpart}
      </div>
    )
  }
}


// ***************************************************************************
// Main class that holds the state of the App

class Viewer extends React.Component {

  render() {

    return (
      <TopicContainer/>
    );
  }
}

// ***************************************************************************
// Wrap the App and return the rendered Viewer

function App() {
  return (
    <Viewer />
  );
}

export default App;
