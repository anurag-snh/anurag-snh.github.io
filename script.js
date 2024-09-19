// Format numbers to k, m, etc.
function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "m";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
}

// Load JSON data
fetch("../../data/vector/target-channel-vector.json")
  .then((response) => response.json())
  .then((data) => {
    const embeddings = data.embeddings;

    // 1. Calculate the number of unique YouTube channels
    const uniqueChannels = new Set(embeddings.map((item) => item.channelId))
      .size;

    // 2. Calculate the number of videos analyzed
    const totalVideos = embeddings.length;

    // 3. Calculate the number of unique niches (by 'topicId')
    const uniqueNiches = new Set(embeddings.map((item) => item.topicId)).size;

    // 4. Calculate the number of sub-topics (by 'subTopicId')
    const uniqueSubTopics = new Set(embeddings.map((item) => item.subTopicId))
      .size;

    // 5. Calculate the total number of video views
    const totalViews = embeddings.reduce(
      (sum, item) => sum + item.videoViewCount,
      0
    );
    const formattedTotalViews = (totalViews / 1e6).toFixed(1) + "M"; // Display in millions

    // 6. Calculate the total number of subscribers
    const totalSubscribers = embeddings.reduce(
      (sum, item) =>
        sum + parseInt(item.channelSubscriberCount.replace(/[^0-9]/g, "")),
      0
    );
    const formattedTotalSubscribers = (totalSubscribers / 1e6).toFixed(1) + "M"; // Display in millions

    // 7. Get the latest published date and time
    const latestVideo = embeddings.reduce(
      (latest, item) =>
        new Date(item.publishedDate) > new Date(latest.publishedDate)
          ? item
          : latest,
      embeddings[0]
    );
    const latestDate = new Date(latestVideo.publishedDate);
    const formattedDate = latestDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = latestDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Now populate the HTML with dashboard info
    document.getElementById("dashboard").innerHTML = `
      <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-uppercase font-weight-bold">YouTube Channels:</p>
                  <h5 class="font-weight-bolder">${uniqueChannels}</h5>
                  <p class="mb-0">
                    <span class="text-success text-sm font-weight-bolder">Video Analysed:</span> ${totalVideos}
                  </p>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-danger shadow-primary text-center rounded-circle">
                  <i class="ni ni-button-play text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-uppercase font-weight-bold">Niche Found:</p>
                  <h5 class="font-weight-bolder">${uniqueNiches}</h5>
                  <p class="mb-0">
                    <span class="text-success text-sm font-weight-bolder">Topics:</span> ${uniqueSubTopics}
                  </p>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-primary shadow-danger text-center rounded-circle">
                  <i class="ni ni-zoom-split-in text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-uppercase font-weight-bold">Total Views:</p>
                  <h5 class="font-weight-bolder">${formattedTotalViews}</h5>
                  <p class="mb-0">
                    <span class="text-success text-sm font-weight-bolder">Total Subs:</span> ${formattedTotalSubscribers}
                  </p>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-warning shadow-warning text-center rounded-circle">
                  <i class="ni ni-chart-pie-35 text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-uppercase font-weight-bold">Last Updated</p>
                  <h5 class="font-weight-bolder">${formattedDate}</h5>
                  <p class="mb-0">
                    <span class="text-success text-sm font-weight-bolder">Time:</span> ${formattedTime}
                  </p>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-success shadow-success text-center rounded-circle">
                  <i class="ni ni-calendar-grid-58 text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  })
  .catch((error) => console.error("Error fetching data:", error));

// topic-trend
// Function to update the "topic-trend" line chart
function updateTopicTrend(subTopicId, data) {
  // Filter videos by subTopicId
  let videos = data.embeddings.filter((item) => item.subTopicId === subTopicId);

  // If no videos are found, log the issue
  if (videos.length === 0) {
    console.error("No videos found for subTopicId:", subTopicId);
    return; // Exit the function to avoid further issues
  }

  // Sort videos by publishedDate from oldest to newest
  videos.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));

  // Extract dates and video view counts
  const labels = videos.map((video) =>
    new Date(video.publishedDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  const viewCounts = videos.map((video) => video.videoViewCount);

  // Update or create the line chart for topic-trend
  const ctx = document.getElementById("topic-trend").getContext("2d");

  if (window.topicTrendChart) {
    // Destroy the old chart and create a new one to avoid incorrect updates
    window.topicTrendChart.destroy();
  }

  // Create a new line chart
  window.topicTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Video View Counts",
          data: viewCounts,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.3,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Ensure chart takes full container space
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const video = videos[tooltipItem.dataIndex];
              let label1 = `${video.title}`;
              let label2 = `${formatNumber(video.videoViewCount)} Views`;
              return [label1, label2];
            },
          },
        },
      },
      onClick: function (evt, activeElements) {
        if (activeElements.length > 0) {
          const clickedIndex = activeElements[0].index;
          const video = videos[clickedIndex];
          const targetElement = document.getElementById(video.videoId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth", // Optional: for smooth scrolling effect
            });
          } else {
            console.error(`Element with ID ${video.videoId} not found.`);
          }
        } else {
          console.error("No active elements found.");
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Published Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Video View Count",
          },
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatNumber(value); // Format view counts with commas
            },
          },
        },
        x: {
          ticks: {
            display: false,
          },
        },
      },
    },
  });
}

function populateVideos(subTopicId, data) {
  // Filter videos with the same subTopicId
  let videos = data.embeddings.filter((item) => item.subTopicId === subTopicId);

  // Sort videos by Outlier
  videos = videos.sort((a, b) => b.videoViewCount - a.videoViewCount);

  // Get the container where the video cards will be displayed
  const videoContainer = document.getElementById("video-container");

  // Clear previous video cards
  videoContainer.innerHTML = "";

  // Iterate through each video and generate HTML
  videos.forEach((video) => {
    const videoHtml = `
      <div class="card col-xl-3 col-sm-6" style="border-radius: 0" id="${
        video.videoId
      }">
        <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
          <a id="img-videoUrl" href="${video.videoUrl}" class="d-block">
            <img
              id="img-thumbnail"
              src="${video.thumbnail}"
              class="img-fluid border-radius-lg"
            />
          </a>
        </div>
        <div class="card-body pt-2">
          <a id="title" href="${
            video.videoUrl
          }" class="card-title h5 d-block text-darker">
            ${video.title}
          </a>
          <span
        class="badge bg-gradient-dark btn-tooltip copy-btn"
        style="cursor: pointer;"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Copy URL"
            data-container="body"
            data-animation="true"
         data-url="${video.videoUrl}">
          <i class="fa fa-share fixed-plugin-button-nav cursor-pointer" aria-hidden="true"></i>
        </span>
          <span
            class="badge bg-gradient-danger btn-tooltip"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Channel Outlier"
            data-container="body"
            data-animation="true"
            id="outlierChannelViews"
          >${video.outlierChannelViews} X</span>
          <span
            class="badge bg-gradient-info btn-tooltip"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Niche Outlier"
            data-container="body"
            data-animation="true"
            id="outlierTopicViews"
          >${video.outlierTopicViews} X</span>
          <span
            class="badge bg-gradient-success btn-tooltip"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Topic Outlier"
            data-container="body"
            data-animation="true"
            id="outlierSubTopicViews"
          >${video.outlierSubTopicViews} X</span>
          <span class="badge bg-gradient-dark" id="videoViewCount">
            ${formatNumber(video.videoViewCount)} Views
          </span>
          <!-- Share/Copy Button -->
        
          <br />
          <span
            class="text-gradient text-primary text-uppercase text-xs font-weight-bold my-2"
            id="channelName"
          >${video.channelName}</span>
          <span
            class="text-gradient text-info text-uppercase text-xs font-weight-bold my-2"
            id="channelSubscriberCount"
          >${formatNumber(
            video.channelSubscriberCount
          )} Subscribers</span><br />
          <small id="publishedDate">${new Date(
            video.publishedDate
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</small>
          
        
        </div>
      </div>
    `;

    // Append the video card to the container
    videoContainer.innerHTML += videoHtml;
  });

  // Add event listener for copy buttons after the HTML is inserted
  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const videoUrl = this.getAttribute("data-url");
      navigator.clipboard
        .writeText(videoUrl)
        .then(() => {
          alert("Video link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    });
  });

  // Initialize Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Add event handler to the Sub-Topic chart
function handleSubTopicChartClick(
  evt,
  activeElements,
  data,
  uniqueSubTopicsMap
) {
  if (activeElements.length > 0) {
    const clickedIndex = activeElements[0].index;
    const subTopicId = Object.keys(uniqueSubTopicsMap)[clickedIndex];

    // Ensure valid subTopicId is selected
    if (subTopicId) {
      populateVideos(subTopicId, data); // Populate videos with the same subTopicId
      updateTopicTrend(subTopicId, data); // Update the topic-trend chart
    }
  }
}

// charts

let subTopicChart; // Variable to store the sub-topic chart instance

// Function to plot the Sub-Topic Chart
function plotSubTopicChart(topicId, data) {
  // Filter subtopics that belong to the selected topicId
  const subTopics = data.embeddings.filter((item) => item.topicId === topicId);

  // Create a map to ensure unique subTopicId
  const uniqueSubTopicsMap = {};
  subTopics.forEach((item) => {
    if (!uniqueSubTopicsMap[item.subTopicId]) {
      uniqueSubTopicsMap[item.subTopicId] = {
        subTopic: item.subTopic,
        subTotalVideos: item.subTotalVideos,
        subAverageViewCount: item.subAverageViewCount,
        subTopicColor: item.subTopicColor,
      };
    }
  });

  // Log unique subtopics to ensure all 10 are present
  // console.log("Unique Sub-Topics Map:", Object.keys(uniqueSubTopicsMap).length);

  // Extract labels and data for the subtopic chart
  const subLabels = [];
  const subTotalVideosData = [];
  const subAvgViewsData = [];
  const subColors = [];

  for (const subTopicId in uniqueSubTopicsMap) {
    subLabels.push(uniqueSubTopicsMap[subTopicId].subTopic); // Sub-topic names for labels
    subTotalVideosData.push(uniqueSubTopicsMap[subTopicId].subTotalVideos); // Total videos for each sub-topic
    subAvgViewsData.push(uniqueSubTopicsMap[subTopicId].subAverageViewCount); // Average views for each sub-topic
    subColors.push(uniqueSubTopicsMap[subTopicId].subTopicColor); // Use sub-topic color provided in the data
  }

  // Log subLabels and subTotalVideosData to ensure all subtopics are included
  // console.log("Sub Labels:", subLabels);
  // console.log("Total Videos Data:", subTotalVideosData);

  // If the sub-topic chart already exists, destroy it before creating a new one
  if (subTopicChart) {
    subTopicChart.destroy();
  }

  // Create the sub-topic chart
  const subCtx = document.getElementById("subtopic-chart").getContext("2d");
  subTopicChart = new Chart(subCtx, {
    type: "bar",
    data: {
      labels: subLabels, // Dynamically populated labels
      datasets: [
        {
          type: "bar",
          label: "Sub-Topic Total Videos",
          data: subTotalVideosData, // Total videos for each sub-topic
          backgroundColor: "rgb(251, 99, 64)", // Color for each bar
          yAxisID: "y1", // Link to secondary y-axis for Total Videos
          maxBarThickness: 30,
        },
        {
          type: "bar",
          label: "Sub-Topic Avg. Views",
          data: subAvgViewsData, // Average views for each sub-topic
          backgroundColor: "rgb(45, 206, 137)", // Color for average views
          yAxisID: "y2", // Link to primary y-axis for Avg. Views
          maxBarThickness: 30,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index", // Show both bars on hover
        intersect: false, // Trigger tooltip for both datasets
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            // Custom tooltip callback to show both total videos and average views in one tooltip
            label: function (tooltipItem) {
              const datasetIndex = tooltipItem.datasetIndex;
              const subTopicIndex = tooltipItem.dataIndex;
              const totalVideos =
                subTotalVideosData[subTopicIndex].toLocaleString();
              const avgViews = formatNumber(subAvgViewsData[subTopicIndex]);

              if (datasetIndex === 0) {
                return `Total Videos: ${totalVideos}`;
              } else {
                return `Avg. Views: ${avgViews}`;
              }
            },
          },
        },
      },
      onClick: function (evt, activeElements) {
        if (activeElements.length > 0) {
          handleSubTopicChartClick(
            evt,
            activeElements,
            data,
            uniqueSubTopicsMap
          ); // Ensure this is firing
        }
      },
      scales: {
        y1: {
          type: "linear",
          position: "left",
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return value.toLocaleString(); // Format Total Videos axis
            },
          },
          title: {
            display: true,
            text: "Videos",
          },
        },
        y2: {
          type: "linear",
          position: "right",
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return formatNumber(value); // Format Avg. Views axis
            },
          },
          title: {
            display: true,
            text: "Average Views",
          },
        },
        x: {
          ticks: {
            display: false,
          },
        },
      },
    },
  });
}

// Fetch and plot the Topic Chart
fetch("../../data/vector/target-channel-vector.json")
  .then((response) => response.json())
  .then((data) => {
    const embeddings = data.embeddings;

    // Filter unique topics by topicId
    const uniqueTopics = {};
    embeddings.forEach((item) => {
      if (!uniqueTopics[item.topicId]) {
        uniqueTopics[item.topicId] = {
          topic: item.topic,
          topicId: item.topicId,
          totalVideos: item.totalVideos,
          averageViewCount: item.averageViewCount,
          color: item.color,
        };
      }
    });

    // Extract labels and data for the chart
    const labels = [];
    const totalVideosData = [];
    const avgViewsData = [];
    const colors = [];
    const topicIds = [];

    for (const topicId in uniqueTopics) {
      labels.push(uniqueTopics[topicId].topic); // Topic names for labels
      totalVideosData.push(uniqueTopics[topicId].totalVideos); // Total videos for each topic
      avgViewsData.push(uniqueTopics[topicId].averageViewCount); // Average views for each topic
      colors.push(uniqueTopics[topicId].color); // Use color provided in the data
      topicIds.push(topicId); // Store topicId for each bar
    }

    // Create the Topic Chart with dual axis
    const ctx = document.getElementById("topic-chart").getContext("2d");
    const topicChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels, // Dynamically populated labels
        datasets: [
          {
            type: "bar",
            label: "Niche Total Videos",
            data: totalVideosData, // Total videos for each topic
            backgroundColor: "rgb(245, 54, 92)", // Unique color per topic
            yAxisID: "y1", // Link to secondary y-axis for Total Videos
            maxBarThickness: 30,
          },
          {
            type: "bar",
            label: "Niche Avg. Views",
            data: avgViewsData, // Average views for each topic
            backgroundColor: "rgb(17, 205, 239)", // Color for average views
            yAxisID: "y2", // Link to primary y-axis for Avg. Views
            maxBarThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index", // Show both bars on hover
          intersect: false, // Trigger tooltip for both datasets
        },
        plugins: {
          legend: {
            display: true,
          },
          // Topic chart tooltip with Total Topics (unique subTopicId count)
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const datasetIndex = tooltipItem.datasetIndex;
                // const dataValue = tooltipItem.raw.toLocaleString();
                // const label = tooltipItem.dataset.label;
                // Get the corresponding other dataset value
                const topicIndex = tooltipItem.dataIndex;
                const totalVideos =
                  totalVideosData[topicIndex].toLocaleString();
                const avgViews = formatNumber(avgViewsData[topicIndex]);

                // Get the topicId of the hovered topic
                const topicId = topicIds[topicIndex];

                // Filter the embeddings for the same topicId and count unique subTopicId
                const uniqueSubTopics = new Set(
                  data.embeddings
                    .filter((item) => item.topicId === topicId)
                    .map((item) => item.subTopicId)
                );

                const totalTopics = uniqueSubTopics.size; // Count unique subTopicId
                let output;

                if (datasetIndex === 0) {
                  let label = `Total Videos: ${totalVideos}`;
                  return label;
                } else {
                  let label1 = `Avg. Views: ${avgViews}`;
                  let label2 = `Total Topics: ${totalTopics}`;
                  return [label1, label2];
                }

                // return `Total Videos: ${totalVideos}, Avg. Views: ${avgViews}, Total Topics: ${totalTopics}`;
              },
            },
          },
        },
        onClick: function (evt, activeElements) {
          if (activeElements.length > 0) {
            const clickedIndex = activeElements[0].index;
            const selectedTopicId = topicIds[clickedIndex];
            plotSubTopicChart(selectedTopicId, data); // Pass the selected topicId to filter subtopics
          }
        },
        scales: {
          y1: {
            type: "linear",
            position: "left",
            ticks: {
              beginAtZero: true,
              callback: function (value) {
                return value.toLocaleString(); // Format Total Videos axis
              },
            },
            title: {
              display: true,
              text: "Videos",
            },
          },
          y2: {
            type: "linear",
            position: "right",
            ticks: {
              beginAtZero: true,
              callback: function (value) {
                return formatNumber(value); // Format Avg. Views axis
              },
            },
            title: {
              display: true,
              text: "Average Views",
            },
          },
          x: {
            ticks: {
              display: false,
              autoSkip: false,
              maxRotation: 90,
              minRotation: 45,
            },
          },
        },
      },
    });

    // Optionally, plot Sub-Topic Chart for the first topic by default
    if (topicIds.length > 0) {
      plotSubTopicChart(topicIds[0], data);
    }
  })
  .catch((error) => console.error("Error fetching data:", error));
