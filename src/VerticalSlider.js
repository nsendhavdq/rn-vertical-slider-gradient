/**
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Easing,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { number } from "prop-types";

type Props = {
  value: number,
  disabled: boolean,
  min: number,
  max: number,
  onChange: (value: number) => void,
  onComplete: (value: number) => void,
  width: number,
  height: number,
  borderRadius: number,
  maximumTrackTintColor: string,
  minimumTrackTintColor: Array<string>,
  showBallIndicator: boolean,
  step?: number,
  ballIndicatorColor?: string,
  ballIndicatorWidth?: number,
  ballIndicatorPosition?: number,
  centerIndicatorPosition?: number,
  ballIndicatorTextColor?: string,
  centerImage?: string,
  centerIndicatorText: String,
  centerTextPosition: number,
};

type State = {
  value: number,
  sliderHeight: any,
  ballHeight: any,
  panResponder: any,
};

export default class VerticalSlider extends Component<Props, State> {
  _moveStartValue = null;

  constructor(props: Props) {
    super(props);

    let panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: () => {
        this._moveStartValue = this.state.value;
      },
      onPanResponderMove: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
        }
      }
    });

    this.state = {
      value: props.value,
      sliderHeight: new Animated.Value(0),
      ballHeight: new Animated.Value(0),
      panResponder
    };
  }

  _fetchNewValueFromGesture(gestureState: any): number {
    const { min, max, step, height } = this.props;
    const ratio = -gestureState.dy / height;
    const diff = max - min;
    if (step) {
      return Math.max(
        min,
        Math.min(
          max,
          this._moveStartValue + Math.round((ratio * diff) / step) * step
        )
      );
    }
    let value = Math.max(min, this._moveStartValue + ratio * diff);
    return Math.floor(value * 100) / 100;
  }

  _getSliderHeight(value: number): number {
    const { min, max, height } = this.props;
    return ((value - min) * height) / (max - min);
  }

  _changeState(value: number): void {
    const { height, ballIndicatorWidth } = this.props;
    const sliderHeight = this._getSliderHeight(value);
    let ballPosition = sliderHeight;
    const ballHeight = (ballIndicatorWidth ? ballIndicatorWidth : 48) / 20;
    if (ballPosition + ballHeight > height) {
      ballPosition = height - ballHeight * 2;
    } else if (ballPosition - ballHeight <= 0) {
      ballPosition = 0;
    } else {
      ballPosition = ballPosition - ballHeight;
    }
    Animated.parallel([
      Animated.timing(this.state.sliderHeight, {
        toValue: sliderHeight,
        easing: Easing.linear
      }),
      Animated.timing(this.state.ballHeight, {
        toValue: ballPosition,
        easing: Easing.linear
      })
    ]).start();
    this.setState({ value });
  }

  _fetchBallIndicatorColor(): string {
    const { value } = this.state;
    const { max, min, ballIndicatorColor } = this.props;
    if (ballIndicatorColor) {
      return ballIndicatorColor;
    }
    const minimumTrackTintColor = this.props.minimumTrackTintColor
      ? this.props.minimumTrackTintColor
      : ["#000000"];
    const colorLength = minimumTrackTintColor.length - 1;
    const percentage = (value / (max - min)) * 100;
    const divideValue = 100 / colorLength;
    let colorIndex = Math.floor(percentage / divideValue);
    // START FOR
    // for (let iterateColor = 0; iterateColor < colorLength; iterateColor++) {
    //   let startValue = iterateColor * divideValue;
    //   let endValue = startValue + divideValue;
    //   if (percentage > startValue && percentage < endValue) {
    //     colorIndex = iterateColor;
    //   }
    // }
    // END FOR
    if (minimumTrackTintColor[colorIndex]) {
      return minimumTrackTintColor[colorIndex];
    }
    return "#000000";
  }

  componentDidMount(): void {
    const { value } = this.props;
    if (value) {
      this._changeState(value);
    }
  }

  render() {
    const {
      value,
      disabled,
      min,
      max,
      onChange,
      onComplete,
      width,
      height,
      borderRadius,
      maximumTrackTintColor,
      minimumTrackTintColor,
      showBallIndicator,
      ballIndicatorColor,
      ballIndicatorWidth,
      ballIndicatorPosition,
      centerTextPosition,
      ballIndicatorTextColor,
      showCenterIndicator,
      centerImage,
      centerIndicatorPosition,
      centerIndicatorText,
    } = this.props;
    return (
      <View style={[{ height, width, borderRadius, alignItems: 'center' }]}>
        <View
          style={[
            styles.container,
            styles.shadow,
            {
              height,
              width,
              borderRadius,
              backgroundColor: maximumTrackTintColor
                ? maximumTrackTintColor
                : "#ECECEC"
            }
          ]}
          {...this.state.panResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.slider,
              {
                height: this.state.sliderHeight,
                width
              }
            ]}
          >
            <LinearGradient
              colors={
                minimumTrackTintColor ? minimumTrackTintColor : ["#000000"]
              }
              start={{ x: 1.0, y: 1.0 }}
              end={{ x: 0.0, y: 0.0 }}
              style={styles.linearGradient}
            />
          </Animated.View>
        </View>
        {this.props.showBallIndicator ? (
          <Animated.View
            style={[
              styles.ball,
              {
                // width: 48,
                // height: 48,
                bottom: this.state.ballHeight,
                left: ballIndicatorPosition ? ballIndicatorPosition : -60,
                backgroundColor: this._fetchBallIndicatorColor()
              }
            ]}
          >
            <Text
              style={[
                styles.ballText,
                {
                  color: ballIndicatorTextColor
                    ? ballIndicatorTextColor
                    : "#000000"
                }
              ]}
            >
              {this.state.value}%
            </Text>
          </Animated.View>
        ) : null}
        
        {showCenterIndicator && this.state.value > 40 ? (
          <Animated.View
            style={[
              styles.ball,
              {
                width: 60,
                height: 60,
                zIndex: 10,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: maximumTrackTintColor,
                bottom: this.state.ballHeight,
                // left: centerIndicatorPosition ? centerIndicatorPosition : 40,
              }
            ]}
          >
            <Image
              resizeMode="cover"
              source={centerImage}
              style={styles.centerImage}
            />
          </Animated.View>
        ) : null}

        {this.state.value > 15 ? (
          <Animated.View
            style={[
              styles.ball,
              {
                width: 60,
                height: 30,
                bottom: this.state.ballHeight,
              }
            ]}
          >
             <Text
              style={[
                styles.ballText,
                {
                  // left: centerTextPosition ? centerTextPosition : 40,
                  color: maximumTrackTintColor,
                }
              ]}
            >
              {centerIndicatorText}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  ball: {
    // position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  ballText: {
    fontWeight: "600",
  },
  container: {
    overflow: 'hidden'
  },
  slider: {
    position: "absolute",
    bottom: 0,
  },
  linearGradient: {
    width: "100%",
    height: "100%"
  },
  centerImage: {
    width: 40,
    height: 40,
  },
});

