package util

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func GetCondition(conditions []metav1.Condition, conditionType string) *metav1.Condition {
	for i := range conditions {
		if conditions[i].Type == conditionType {
			return &conditions[i]
		}
	}
	return nil
}

func SetCondition(conditions *[]metav1.Condition, newCondition metav1.Condition) {
	if conditions == nil {
		conditions = &[]metav1.Condition{}
	}
	existingCondition := GetCondition(*conditions, newCondition.Type)
	if existingCondition == nil {
		newCondition.LastTransitionTime = metav1.Now()
		*conditions = append(*conditions, newCondition)
		return
	}
	if existingCondition.Status != newCondition.Status {
		existingCondition.Status = newCondition.Status
		existingCondition.LastTransitionTime = metav1.Now()
	}
	existingCondition.Reason = newCondition.Reason
	existingCondition.Message = newCondition.Message
}

func RemoveCondition(conditions *[]metav1.Condition, conditionType string) {
	if conditions == nil {
		return
	}
	for i, c := range *conditions {
		if c.Type == conditionType {
			*conditions = append((*conditions)[:i], (*conditions)[i+1:]...)
			return
		}
	}
}

func ConditionIsTrue(conditions []metav1.Condition, conditionType string) bool {
	if condition := GetCondition(conditions, conditionType); condition != nil {
		return condition.Status == metav1.ConditionTrue
	}
	return false
}

func ConditionIsFalse(conditions []metav1.Condition, conditionType string) bool {
	if condition := GetCondition(conditions, conditionType); condition != nil {
		return condition.Status == metav1.ConditionFalse
	}

	return false
}

func ConditionIsUnknown(conditions []metav1.Condition, conditionType string) bool {
	if condition := GetCondition(conditions, conditionType); condition != nil {
		return condition.Status == metav1.ConditionUnknown
	}
	return false
}

func ConditionIsNotTrue(conditions []metav1.Condition, conditionType string) bool {
	return !ConditionIsTrue(conditions, conditionType)
}

func ConditionsAreTrue(conditions []metav1.Condition, conditionTypes ...string) bool {
	for _, conditionType := range conditionTypes {
		if ConditionIsTrue(conditions, conditionType) == false {
			return false
		}
	}
	return true
}

func ConditionOutOfDate(conditions []metav1.Condition, conditionType string, duration metav1.Duration) bool {
	if condition := GetCondition(conditions, conditionType); condition != nil {
		return condition.LastTransitionTime.Add(duration.Duration).Before(metav1.Now().Time)
	}
	return false
}
