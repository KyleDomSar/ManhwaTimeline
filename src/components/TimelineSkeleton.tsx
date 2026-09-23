import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export function TimelineSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.kicker} />
      <View style={styles.title} />
      <View style={styles.subtitle} />
      <View style={styles.stats}>
        <Block /><Block /><Block />
      </View>
      <View style={styles.card}>
        <View style={styles.lineLarge} />
        <View style={styles.line} />
        <View style={styles.lineShort} />
      </View>
      <View style={styles.sectionTitle} />
      <View style={styles.item}><View style={styles.itemLine} /></View>
      <View style={styles.item}><View style={styles.itemLine} /></View>
    </View>
  );
}

function Block() {
  return <View style={styles.block}><View style={styles.blockLine} /><View style={styles.blockShort} /></View>;
}

const styles=StyleSheet.create({
  container:{padding:spacing.lg},
  kicker:{width:110,height:10,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated},
  title:{width:190,height:28,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated,marginTop:spacing.sm},
  subtitle:{width:"80%",height:10,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated,marginTop:spacing.sm},
  stats:{flexDirection:"row",gap:spacing.sm,marginTop:spacing.xl},
  block:{flex:1,height:72,borderRadius:radius.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:spacing.md},
  blockLine:{width:28,height:20,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated},
  blockShort:{width:48,height:9,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated,marginTop:spacing.sm},
  card:{marginTop:spacing.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:spacing.md},
  lineLarge:{width:"55%",height:14,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated},
  line:{width:"100%",height:8,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated,marginTop:spacing.md},
  lineShort:{width:"30%",height:8,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated,marginTop:spacing.sm},
  sectionTitle:{width:150,height:20,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated,marginTop:spacing.xl,marginBottom:spacing.sm},
  item:{height:58,borderRadius:radius.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,padding:spacing.md,marginBottom:spacing.sm},
  itemLine:{width:"70%",height:12,borderRadius:radius.sm,backgroundColor:colors.surfaceElevated},
});
