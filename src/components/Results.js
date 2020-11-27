import React, { Component } from "react";
import { Loading } from "react-simple-chatbot";
import { bc, bc_topic, dpr, dpr_topic, topic } from "../dummy/data.json";
import "../styles/accordion.css";
import { v4 as uuidv4 } from 'uuid';

export default class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      trigger: false,
      level: null,
      subject: null,
      results: [],
    };

    this.triggerNext = this.triggerNext.bind(this);
  }

  async componentWillMount() {
    const { steps } = this.props;
    const { level, subject } = steps;

    const results = await Promise.all([
      (
        await Promise.all(
          bc.map((row) => {
            try {
              if (
                row.grade_id == level.value &&
                row.major_id == subject.value
              ) {
                const filter = bc_topic.filter((bc) => bc.id == row.id);
                const category =
                  filter.length > 0
                    ? topic.filter((topic) => topic.id == filter[0].topic_id)
                    : false;
                return {
                  name: row.name,
                  image: row.image,
                  topic: category
                    ? category.length > 0
                      ? category[0].name
                      : null
                    : null,
                };
              }
              return false;
            } catch (error) {
              return false;
            }
          })
        )
      ).filter((bc) => bc),
      (
        await Promise.all(
          dpr.map((row) => {
            try {
              if (
                row.grade_id == level.value &&
                row.major_id == subject.value
              ) {
                const filter = dpr_topic.filter((dpr) => dpr.id == row.id);
                const category =
                  filter.length > 0
                    ? topic.filter((topic) => topic.id == filter[0].topic_id)
                    : false;
                return {
                  name: row.name,
                  image: row.image,
                  topic: category
                    ? category.length > 0
                      ? category[0].name
                      : null
                    : null,
                };
              }
              return false;
            } catch (error) {
              return false;
            }
          })
        )
      ).filter((dpr) => dpr),
    ]);
    this.setState({ level, subject, results, loading: false });
  }

  triggerNext() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep();
    });
  }

  componentDidMount() {
    this.props.triggerNextStep();
  }

  render() {
    const { loading, level, subject, results } = this.state;
    return (
      <div style={{ width: "100%" }}>
        {loading ? (
          <Loading />
        ) : results.length > 0 ? (
          <div style={{}}>
            Berikut beberapa materi {subject.message} pada jenjang{" "}
            {level.message} yang Mejakitabot punya
            {results.map((bcdpr, parentI) => {
              return bcdpr.map((row, i) => {
                const uuid = uuidv4()
                return (
                <div key={i + 1} style={{ paddingTop: 12 }}>
                  <nav className="accordion arrows" style={{}}>
                    <input
                      type="radio"
                      name="accordion"
                      id={`bcdpr-${parentI}-${i + 1}-${uuid}`}
                    />
                    <section className="box">
                      <label
                        className="box-title"
                        htmlFor={`bcdpr-${parentI}-${i + 1}-${uuid}`}
                      >
                        {row.name}
                      </label>
                      <label
                        className="box-close"
                        htmlFor="acc-close"
                      ></label>
                      <div className="box-content">
                        <small>{row.topic}</small>
                        <img
                          src={`/${row.image}`}
                          alt="img"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </section>
                    <input type="radio" name="accordion" id="acc-close" />
                  </nav>
                </div>
                )
              });
            })}
          </div>
        ) : (
          <div>
            Maaf yah, Mejakitabot tidak dapat menemukan apa yang kamu cari
          </div>
        )}
      </div>
    );
  }
}
