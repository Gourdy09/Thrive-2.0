import { Colors } from "@/constants/Colors";
import { ForecastData, useGlucoseForecast } from "@/hooks/useglucoseforecast";
import { useFocusEffect } from "@react-navigation/native";
import React, { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const CHART_HEIGHT = 280;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 36;
const PADDING_LEFT = 48;
const HOURS_SHOWN = 24;
const SCREEN_W = Dimensions.get("window").width;
const CHART_W = Math.max(SCREEN_W * 3, 900);
const PLOT_H = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const PLOT_W = CHART_W - PADDING_LEFT;

const G_MIN = 40;
const G_MAX = 300;

function toX(hour: number): number {
  return PADDING_LEFT + (hour / HOURS_SHOWN) * PLOT_W;
}

function toY(glucose: number): number {
  const clamped = Math.max(G_MIN, Math.min(G_MAX, glucose));
  return PADDING_TOP + PLOT_H * (1 - (clamped - G_MIN) / (G_MAX - G_MIN));
}

function pointsToPath(xs: number[], ys: number[], closed = false): string {
  if (!xs.length) return "";
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  if (closed) d += " Z";
  return d;
}

function bandPath(
  timePoints: number[],
  lower: number[],
  upper: number[],
): string {
  if (!timePoints.length) return "";
  const xs = timePoints.map(toX);
  const upperY = upper.map(toY);
  const lowerY = lower.map(toY);

  // trace upper left→right, then lower right→left to close shape
  let d = `M ${xs[0]} ${upperY[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cpx} ${upperY[i - 1]}, ${cpx} ${upperY[i]}, ${xs[i]} ${upperY[i]}`;
  }
  for (let i = xs.length - 1; i >= 0; i--) {
    const cpx = i > 0 ? (xs[i - 1] + xs[i]) / 2 : xs[0];
    if (i === xs.length - 1) {
      d += ` L ${xs[i]} ${lowerY[i]}`;
    } else {
      d += ` C ${cpx} ${lowerY[i + 1]}, ${cpx} ${lowerY[i]}, ${xs[i]} ${lowerY[i]}`;
    }
  }
  return d + " Z";
}

function YAxis({ isDark }: { isDark: boolean }) {
  const ticks = [60, 100, 140, 180, 220, 260];
  const color = isDark ? "#6b7280" : "#9ca3af";
  return (
    <>
      {ticks.map((v) => {
        const y = toY(v);
        return (
          <React.Fragment key={v}>
            <Line
              x1={PADDING_LEFT}
              y1={y}
              x2={CHART_W}
              y2={y}
              stroke={isDark ? "#1f2937" : "#f3f4f6"}
              strokeWidth={1}
            />
            <SvgText
              x={PADDING_LEFT - 6}
              y={y + 4}
              fontSize={10}
              fill={color}
              textAnchor="end"
            >
              {v}
            </SvgText>
          </React.Fragment>
        );
      })}
    </>
  );
}
function XAxis({ isDark }: { isDark: boolean }) {
  const color = isDark ? "#6b7280" : "#9ca3af";
  return (
    <>
      {Array.from({ length: 25 }, (_, i) => {
        const x = toX(i);
        const label =
          i === 0
            ? "12AM"
            : i < 12
              ? `${i}AM`
              : i === 12
                ? "12PM"
                : `${i - 12}PM`;
        return (
          <React.Fragment key={i}>
            <Line
              x1={x}
              y1={PADDING_TOP}
              x2={x}
              y2={PADDING_TOP + PLOT_H}
              stroke={isDark ? "#1f2937" : "#f3f4f6"}
              strokeWidth={i % 6 === 0 ? 1 : 0.5}
            />
            {i % 3 === 0 && (
              <SvgText
                x={x}
                y={CHART_HEIGHT - 6}
                fontSize={10}
                fill={color}
                textAnchor="middle"
              >
                {label}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

function NowHighlight({
  isDark,
  currentHour,
}: {
  isDark: boolean;
  currentHour: number;
}) {
  const x = toX(currentHour);
  const colWidth = PLOT_W / HOURS_SHOWN;

  return (
    <>
      <Rect
        x={x}
        y={PADDING_TOP}
        width={colWidth}
        height={PLOT_H}
        fill={isDark ? "rgba(199,218,57,0.12)" : "rgba(199,218,57,0.12)"}
        rx={3}
      />
      <Line
        x1={x}
        y1={PADDING_TOP}
        x2={x}
        y2={PADDING_TOP + PLOT_H}
        stroke="#afa303ff"
        strokeWidth={1.5}
      />
    </>
  );
}

// target band (70–180 mg/dL)
function TargetBand({ isDark }: { isDark: boolean }) {
  const y1 = toY(180);
  const y2 = toY(70);
  return (
    <Rect
      x={PADDING_LEFT}
      y={y1}
      width={PLOT_W}
      height={y2 - y1}
      fill={isDark ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.08)"}
    />
  );
}

function ForecastLayers({
  data,
  isDark,
}: {
  data: ForecastData;
  isDark: boolean;
}) {
  const { timePoints, trajectory, mu, lower, upper } = data;

  const trajXs = timePoints.map(toX);
  const trajYs = trajectory.map(toY);
  const muXs = timePoints.map(toX);
  const muYs = mu.map(toY);

  const confidencePath = useMemo(
    () => bandPath(timePoints, lower, upper),
    [timePoints, lower, upper],
  );
  const muPath = useMemo(() => pointsToPath(muXs, muYs), [muXs, muYs]);
  const trajPath = useMemo(
    () => pointsToPath(trajXs, trajYs),
    [trajXs, trajYs],
  );
  const nowIndex = timePoints.findIndex(
    (t) => t >= new Date().getHours() + new Date().getMinutes() / 60,
  );
  const currX = nowIndex >= 0 ? trajXs[nowIndex] : trajXs[trajXs.length - 1];
  const currY = nowIndex >= 0 ? trajYs[nowIndex] : trajYs[trajYs.length - 1];

  return (
    <>
      {/* confidence band */}
      <Defs>
        <LinearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop
            offset="0"
            stopColor="#6366f1"
            stopOpacity={isDark ? 0.25 : 0.15}
          />
          <Stop
            offset="1"
            stopColor="#6366f1"
            stopOpacity={isDark ? 0.08 : 0.04}
          />
        </LinearGradient>
      </Defs>
      <Path d={confidencePath} fill="url(#bandGrad)" />

      {/* raw trajectory — dashed and dimmed so it doesn't overlap μ */}
      <Path
        d={trajPath}
        fill="none"
        stroke="#6366f1"
        strokeWidth={1.5}
        strokeOpacity={0.35}
        strokeDasharray="4 4"
      />

      {/* μ line — past (solid) */}
      <Path
        d={pointsToPath(
          muXs.slice(0, nowIndex + 1),
          muYs.slice(0, nowIndex + 1),
        )}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2.5}
      />

      {/* μ line — future (faded) */}
      <Path
        d={pointsToPath(muXs.slice(nowIndex), muYs.slice(nowIndex))}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeOpacity={0.4}
      />

      {/* current point dot */}
      <Circle
        cx={currX}
        cy={currY}
        r={5}
        fill="#6366f1"
        stroke="#fff"
        strokeWidth={1.5}
      />
    </>
  );
}

interface GlucoseChartProps {
  sequences: any[];
  sensorWindows: any[];
}
export default function GlucoseChart({ sequences = [], sensor_windows = [] }) {
  const colorScheme = useColorScheme() ?? "dark";
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme];
  const scrollRef = useRef<ScrollView>(null);

  //  pass sequences and sensorWindows into hook
  const { data, loading, error } = useGlucoseForecast();

  const currentHour = useMemo(() => {
    if (!data?.timePoints?.length)
      return new Date().getHours() + new Date().getMinutes() / 60;
    const nowIndex = data.timePoints.findIndex(
      (t) => t >= new Date().getHours() + new Date().getMinutes() / 60,
    );
    return nowIndex >= 0
      ? data.timePoints[nowIndex]
      : data.timePoints[data.timePoints.length - 1];
  }, [data]);

  // scroll to current hour on mount / focus
  useFocusEffect(
    React.useCallback(() => {
      const scrollX = toX(currentHour) - SCREEN_W / 2;
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: Math.max(0, scrollX),
          animated: false,
        });
      }, 80);
    }, [currentHour]),
  );

  return (
    <View style={{ backgroundColor: theme.background }}>
      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          paddingHorizontal: 4,
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 16,
              height: 3,
              backgroundColor: "#6366f1",
              borderRadius: 2,
            }}
          />
          <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280" }}>
            μ (predicted)
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 16,
              height: 10,
              backgroundColor: "#6366f180",
              borderRadius: 2,
            }}
          />
          <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280" }}>
            ±Δ band
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 16,
              height: 1,
              backgroundColor: isDark ? "#4b5563" : "#d1d5db",
              borderRadius: 2,
              borderStyle: "dashed",
            }}
          />
          <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280" }}>
            raw G̃
          </Text>
        </View>
      </View>

      {loading && !data && (
        <View
          style={{
            height: CHART_HEIGHT,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color="#6366f1" />
          <Text
            style={{
              color: isDark ? "#6b7280" : "#9ca3af",
              fontSize: 12,
              marginTop: 8,
            }}
          >
            Loading forecast…
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4 }}
      >
        <Svg width={CHART_W} height={CHART_HEIGHT}>
          <TargetBand isDark={isDark} />
          <YAxis isDark={isDark} />
          <XAxis isDark={isDark} />
          <NowHighlight isDark={isDark} currentHour={currentHour} />
          {data && <ForecastLayers data={data} isDark={isDark} />}
        </Svg>
      </ScrollView>
    </View>
  );
}
